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
      return NextResponse.json({ error: 'AI key not configured (GEMINI_API_KEY missing)' }, { status: 500 });
    }

    const { messages, hotelId } = await req.json();
    if (!hotelId || !messages || !messages.length) {
      return NextResponse.json({ error: 'Missing hotelId or messages' }, { status: 400 });
    }

    const systemPrompt = `You are the Admin AI Assistant for Joebrown Palace Hotel and Suites.
You have access to powerful tools to manage the hotel's operations. 
When the user asks you to perform an action, use the appropriate tool. 
Keep your verbal responses extremely short, punchy, and conversational (1-2 sentences), because they will be read aloud to the user via Text-to-Speech.

If they ask for instructions on how to do something, explain it to them concisely based on your general knowledge of the dashboard.`;

    // 1. Tool declarations for Interactions API
    const toggleStockTool = {
      type: 'function',
      name: 'toggle_menu_stock',
      description: 'Toggle a menu item to be In Stock or Out of Stock',
      parameters: {
        type: 'object',
        properties: {
          itemName: { type: 'string', description: 'The name of the menu item (e.g. Heineken, Chicken Wings)' },
          inStock: { type: 'boolean', description: 'True to mark it available, False to mark it out of stock' }
        },
        required: ['itemName', 'inStock']
      }
    };

    const getRevenueTool = {
      type: 'function',
      name: 'get_daily_revenue',
      description: 'Calculate the total revenue from orders placed today.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    };

    const approveStaffTool = {
      type: 'function',
      name: 'approve_pending_staff',
      description: 'Approve a pending staff member and assign them a role.',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string', description: 'The email address of the staff member to approve' },
          role: { type: 'string', enum: ['admin', 'reception', 'kitchen', 'concierge'], description: 'The role to assign them' }
        },
        required: ['email', 'role']
      }
    };

    const checkRoomTool = {
      type: 'function',
      name: 'check_room_availability',
      description: 'Check if a room is available or occupied right now.',
      parameters: {
        type: 'object',
        properties: {
          roomName: { type: 'string', description: 'The name or number of the room (e.g. Room 101)' }
        },
        required: ['roomName']
      }
    };

    const tools = [toggleStockTool, getRevenueTool, approveStaffTool, checkRoomTool];

    // 2. Format history for Interactions API
    // Vercel SDK sends { role: 'user' | 'assistant', content: string }
    // Interactions API expects 'user_input' or 'model_output' steps
    const history = messages.map((m: any) => ({
      type: m.role === 'user' ? 'user_input' : 'model_output',
      content: [{ type: 'text', text: m.content }]
    }));

    // 3. First Interactions API Call (gemini-3.6-flash)
    let interaction = await client.interactions.create({
      model: 'gemini-3.6-flash',
      store: false, // stateless mode for simplicity since we pass history
      input: history,
      tools: tools,
      system_instruction: systemPrompt
    });

    history.push(...interaction.steps);

    // 4. Handle Function Calling Loop
    let maxToolTurns = 3;
    while (maxToolTurns > 0) {
      const fcStep = interaction.steps.find((s: any) => s.type === 'function_call');
      if (!fcStep) break;

      let resultText = '';
      try {
        if (fcStep.name === 'toggle_menu_stock') {
          const { itemName, inStock } = fcStep.arguments;
          const { data, error } = await supabase
            .from('menu_items')
            .update({ is_available: inStock })
            .ilike('name', `%${itemName}%`)
            .eq('hotel_id', hotelId)
            .select('name')
            .single();
          if (error || !data) resultText = `Failed to find menu item matching "${itemName}".`;
          else resultText = `Successfully marked ${data.name} as ${inStock ? 'In Stock' : 'Out of Stock'}.`;
        } 
        else if (fcStep.name === 'get_daily_revenue') {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const { data, error } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('hotel_id', hotelId)
            .gte('created_at', startOfDay.toISOString());
          if (error || !data) resultText = 'Failed to retrieve revenue data.';
          else {
            const total = data.reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
            resultText = `Total revenue so far today is ₦${total.toLocaleString()}.`;
          }
        }
        else if (fcStep.name === 'approve_pending_staff') {
          const { email, role } = fcStep.arguments;
          const { data, error } = await supabase
            .from('staff')
            .update({ role })
            .eq('email', email)
            .eq('hotel_id', hotelId)
            .select('email')
            .single();
          if (error || !data) resultText = `Failed to find a pending staff member with email "${email}".`;
          else resultText = `Successfully approved ${data.email} as a ${role}.`;
        }
        else if (fcStep.name === 'check_room_availability') {
          const { roomName } = fcStep.arguments;
          const { data: room } = await supabase
            .from('rooms')
            .select('id, name')
            .ilike('name', `%${roomName}%`)
            .eq('hotel_id', hotelId)
            .single();
          if (!room) resultText = `Room "${roomName}" not found.`;
          else {
            const { data: activeBookings } = await supabase
              .from('bookings')
              .select('id, guest_name')
              .eq('room_id', room.id)
              .eq('status', 'checked_in');
            if (activeBookings && activeBookings.length > 0) {
              resultText = `${room.name} is currently occupied by ${activeBookings[0].guest_name}.`;
            } else {
              resultText = `${room.name} is currently available.`;
            }
          }
        }
      } catch (err: any) {
        resultText = `Error executing tool: ${err.message}`;
      }

      // Add the function result to history
      history.push({
        type: 'function_result',
        name: fcStep.name,
        call_id: fcStep.id,
        result: [{ type: 'text', text: resultText }]
      });

      // Call Gemini again with the function result
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

    const outputText = interaction.output_text || 'No response generated.';

    // 5. Generate Native Text-to-Speech using gemini-3.1-flash-tts-preview
    let audioBase64 = null;
    try {
      const ttsInteraction = await client.interactions.create({
        model: 'gemini-3.1-flash-tts-preview',
        input: outputText,
        response_format: { type: 'audio' },
        generation_config: {
          speech_config: [
            { voice: 'Puck' } // Upbeat, friendly voice
          ]
        }
      });
      
      if (ttsInteraction.output_audio?.data) {
        audioBase64 = ttsInteraction.output_audio.data;
      }
    } catch (ttsErr) {
      console.error('TTS Error:', ttsErr);
      // Fallback to text only if TTS fails
    }

    return NextResponse.json({ 
      status: 'success', 
      text: outputText,
      audio: audioBase64 
    });

  } catch (error: any) {
    console.error('Admin AI Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
