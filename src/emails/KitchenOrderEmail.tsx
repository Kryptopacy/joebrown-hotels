import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface KitchenOrderEmailProps {
  guestName: string;
  orderNumber: string;
  roomOrTable: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
}

export const KitchenOrderEmail = ({
  guestName,
  orderNumber,
  roomOrTable,
  items,
  totalAmount,
}: KitchenOrderEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Received! 🍽️</Heading>
          <Text style={text}>
            Hello {guestName},
          </Text>
          <Text style={text}>
            We've received your Restaurant & Lounge order. Our chefs and bartenders are getting it ready for you!
          </Text>
          
          <Section style={detailsSection}>
            <Text style={detailText}><strong>Order Number:</strong> {orderNumber}</Text>
            <Text style={detailText}><strong>Location:</strong> {roomOrTable || 'Walk-in / Takeaway'}</Text>
            
            <Hr style={hr} />
            
            <Text style={detailText}><strong>Your Order:</strong></Text>
            {items.map((item, idx) => (
              <Text key={idx} style={itemText}>
                {item.quantity}x {item.name} — ₦{(item.price * item.quantity).toLocaleString()}
              </Text>
            ))}
            
            <Hr style={hr} />
            <Text style={detailText}><strong>Total Amount:</strong> ₦{totalAmount.toLocaleString()}</Text>
          </Section>

          <Text style={footer}>
            You can track your order status on your device.
          </Text>
          <Text style={footer}>
            — The Joebrown Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#FFFCEB',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '20px 40px',
  borderRadius: '12px',
  border: '1px solid #fcd34d',
  maxWidth: '600px',
};

const h1 = {
  color: '#b45309',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '20px 0',
};

const text = {
  color: '#334155',
  fontSize: '16px',
  lineHeight: '24px',
};

const detailsSection = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const detailText = {
  color: '#0f172a',
  fontSize: '15px',
  margin: '8px 0',
};

const itemText = {
  color: '#334155',
  fontSize: '14px',
  margin: '4px 0',
  paddingLeft: '10px',
};

const hr = {
  borderColor: '#fde68a',
  margin: '20px 0',
};

const footer = {
  color: '#64748b',
  fontSize: '14px',
  lineHeight: '22px',
};

export default KitchenOrderEmail;
