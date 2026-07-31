import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const client = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ status: 'offline', message: 'AI key not configured' });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // 1. Fetch Chat History
    const { data: messages, error: msgError } = await supabase
      .from('customer_intercom_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (msgError || !messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages found' }, { status: 404 });
    }

    // 2. Check for Human Handoff
    const requiresHuman = messages.some((m: any) => m.requires_human === true);
    if (requiresHuman) {
      return NextResponse.json({ status: 'handed_off', message: 'Session is handled by human' });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender_type !== 'guest') {
      return NextResponse.json({ status: 'ignored', message: 'Last message was not from guest' });
    }

    const hotelId = lastMessage.hotel_id;
    const guestName = lastMessage.guest_name;
    const roomOrTable = lastMessage.room_or_table;

    // 3. Instant Keyword-Based Frustration Detection
    const userMessageStr = lastMessage.message.toLowerCase();
    const frustrationKeywords = ['human', 'manager', 'person', 'angry', 'upset', 'complaint', 'stupid bot', 'real person', 'staff', 'help'];
    const seemsFrustrated = frustrationKeywords.some(kw => userMessageStr.includes(kw));

    if (seemsFrustrated) {
      await supabase.from('customer_intercom_messages').update({ requires_human: true }).eq('id', lastMessage.id);
      await supabase.from('customer_intercom_messages').insert({
        hotel_id: hotelId, session_id: sessionId, guest_name: 'System', room_or_table: roomOrTable, sender_type: 'system', message: 'A staff member has been notified and will assist you shortly.'
      });
      return NextResponse.json({ status: 'handed_off', text: 'I am connecting you to a staff member right away.' });
    }

    // 4. Fetch Dynamic Knowledge Base
    const { data: hotel } = await supabase.from('hotels').select('*').eq('id', hotelId).single();
    const { data: rooms } = await supabase.from('rooms').select('name, price_per_night, slug').eq('hotel_id', hotelId);
    const { data: menu } = await supabase.from('menu_items').select('name, price, is_available').eq('hotel_id', hotelId);

    if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });

    const systemPrompt = `You are the AI Concierge for ${hotel.name}.
Your job is to assist guests warmly and politely. The guest you are speaking to is named "${guestName}", located at "${roomOrTable}".

## Knowledge Base
Check-in/out: ${hotel.ai_checkin_policy || 'Standard hotel policies apply.'}
WiFi: ${hotel.ai_wifi_info || 'Ask front desk.'}
Parking: ${hotel.ai_parking_info || 'Ask front desk.'}
Pets/Smoking: ${hotel.ai_pet_smoking_policy || 'Standard hotel policies apply.'}
Amenities: ${hotel.ai_amenities || 'Standard hotel amenities.'}
FAQs: ${hotel.ai_custom_faq || 'None'}

## Available Rooms
${rooms?.map((r: any) => `- ${r.name}: ₦${r.price_per_night} / night (Link: /rooms/${r.slug})`).join('\n')}

## Menu Items
${menu?.filter((m: any) => m.is_available).map((m: any) => `- ${m.name}: ₦${m.price}`).join('\n')}

## Critical Instructions:
1. ONLY answer questions using the knowledge base, rooms, and menu provided above. 
2. Do NOT guess or make up information (hallucinate).
3. If a guest asks a question you do not know the answer to, or if they are frustrated, you MUST immediately call the "handoffToHuman" tool.
4. If a guest wants to book a room, provide them the link to the room.
5. If a guest wants to order food, use the "placeOrder" tool.
6. If a guest wants towels or cleaning, use the "requestService" tool.
7. Keep responses concise, professional, and friendly.`;

    // 5. Setup Tools
    const requestServiceTool = {
      type: 'function',
      name: 'requestService',
      description: 'Submit a service request (e.g. towels, cleaning) on behalf of the guest.',
      parameters: {
        type: 'object',
        properties: {
          requestType: { type: 'string', enum: ['cleaning', 'towels', 'late_checkout', 'other'] },
          notes: { type: 'string', description: 'Specific details from the guest' }
        },
        required: ['requestType']
      }
    };

    const placeOrderTool = {
      type: 'function',
      name: 'placeOrder',
      description: 'Place a food/drink order from the menu for the guest.',
      parameters: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { type: 'string' }, description: 'List of exact menu item names' },
          specialInstructions: { type: 'string' }
        },
        required: ['items']
      }
    };

    const handoffTool = {
      type: 'function',
      name: 'handoffToHuman',
      description: 'Call this IMMEDIATELY if you do not know the answer, if the guest is angry, or if they ask to speak to a human.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Reason for handoff' }
        },
        required: ['reason']
      }
    };

    const tools = [requestServiceTool, placeOrderTool, handoffTool];

    // 6. Format History for Interactions API
    const history = messages.map((m: any) => ({
      type: m.sender_type === 'guest' ? 'user_input' : 'model_output',
      content: [{ type: 'text', text: m.message }]
    }));

    // 7. Interactions API Call
    let interaction = await client.interactions.create({
      model: 'gemini-3.6-flash',
      store: false,
      input: history,
      tools: tools,
      system_instruction: systemPrompt
    });
    
    history.push(...interaction.steps);

    // 8. Tool Execution Loop
    let maxToolTurns = 2;
    while (maxToolTurns > 0) {
      const fcStep = interaction.steps.find((s: any) => s.type === 'function_call');
      if (!fcStep) break;

      let resultText = '';
      try {
        if (fcStep.name === 'requestService') {
          const { requestType, notes } = fcStep.arguments;
          const actualRoom = roomOrTable && roomOrTable !== 'Lobby/Web' ? roomOrTable : 'Unknown Room';
          await supabase.from('service_requests').insert({
            hotel_id: hotelId, room_number: actualRoom, request_type: requestType, status: 'pending'
          });
          resultText = `Service request for ${requestType} created successfully.`;
        } 
        else if (fcStep.name === 'placeOrder') {
          const { items, specialInstructions } = fcStep.arguments;
          const { data: dbItems } = await supabase.from('menu_items').select('id, name, price').in('name', items);
          if (!dbItems || dbItems.length === 0) resultText = 'Error: None of those items were found on the menu.';
          else {
            const total = dbItems.reduce((sum: number, item: any) => sum + Number(item.price), 0);
            const { data: order } = await supabase.from('orders').insert({
              hotel_id: hotelId, guest_name: guestName, room_or_table: roomOrTable, status: 'pending', payment_status: 'unpaid', total_amount: total, special_instructions: specialInstructions
            }).select('id').single();
            if (order) {
               const orderItems = dbItems.map((item: any) => ({
                 order_id: order.id, menu_item_id: item.id, item_name: item.name, item_price: item.price, quantity: 1
               }));
               await supabase.from('order_items').insert(orderItems);
            }
            resultText = `Order placed successfully for ${dbItems.map((i: any) => i.name).join(', ')}. Total: ₦${total}.`;
          }
        } 
        else if (fcStep.name === 'handoffToHuman') {
          await supabase.from('customer_intercom_messages').update({ requires_human: true }).eq('id', lastMessage.id);
          resultText = 'Successfully handed off to human. Tell the guest you have connected them to a staff member.';
        }
      } catch (err: any) {
        resultText = `Error executing tool: ${err.message}`;
      }

      history.push({
        type: 'function_result',
        name: fcStep.name,
        call_id: fcStep.id,
        result: [{ type: 'text', text: resultText }]
      });

      interaction = await client.interactions.create({
        model: 'gemini-3.6-flash',
        store: false,
        input: history,
        tools: tools,
        system_instruction: systemPrompt
      });
      history.push(...interaction.steps);
      maxToolTurns--;
    }

    const outputText = interaction.output_text;

    // 9. Insert AI Response into Database
    if (outputText) {
      await supabase.from('customer_intercom_messages').insert({
        hotel_id: hotelId,
        session_id: sessionId,
        guest_name: 'AI Concierge',
        room_or_table: 'System',
        sender_type: 'ai',
        message: outputText
      });
    }

    return NextResponse.json({ status: 'success', text: outputText });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
