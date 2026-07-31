import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface PaymentReceiptEmailProps {
  guestName: string;
  bookingRef: string;
  amountPaid: number;
  paymentMethod: string;
  date: string;
}

export const PaymentReceiptEmail = ({
  guestName,
  bookingRef,
  amountPaid,
  paymentMethod,
  date,
}: PaymentReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Received 💳</Heading>
          <Text style={text}>
            Hello {guestName},
          </Text>
          <Text style={text}>
            This email is to confirm that we have successfully received your payment for your upcoming stay at Joebrown Palace Hotel and Suites.
          </Text>
          
          <Section style={detailsSection}>
            <Text style={detailText}><strong>Booking Reference:</strong> {bookingRef}</Text>
            <Text style={detailText}><strong>Amount Paid:</strong> ₦{amountPaid.toLocaleString()}</Text>
            <Text style={detailText}><strong>Payment Method:</strong> {paymentMethod}</Text>
            <Text style={detailText}><strong>Date:</strong> {date}</Text>
          </Section>

          <Text style={text}>
            We look forward to welcoming you!
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            — The Joebrown Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = { backgroundColor: '#FFFCEB', fontFamily: 'system-ui, -apple-system, sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '40px auto', padding: '20px 40px', borderRadius: '12px', border: '1px solid #fcd34d', maxWidth: '600px' };
const h1 = { color: '#b45309', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, margin: '20px 0' };
const text = { color: '#334155', fontSize: '16px', lineHeight: '24px' };
const detailsSection = { backgroundColor: '#fef3c7', padding: '20px', borderRadius: '8px', margin: '24px 0' };
const detailText = { color: '#0f172a', fontSize: '15px', margin: '8px 0' };
const hr = { borderColor: '#fde68a', margin: '20px 0' };
const footer = { color: '#64748b', fontSize: '14px', lineHeight: '22px' };

export default PaymentReceiptEmail;
