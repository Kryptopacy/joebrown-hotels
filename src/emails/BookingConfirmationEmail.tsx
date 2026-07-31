import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface BookingConfirmationEmailProps {
  guestName: string;
  bookingRef: string;
  checkIn: string;
  checkOut: string;
  roomName: string;
  totalAmount: number;
}

export const BookingConfirmationEmail = ({
  guestName,
  bookingRef,
  checkIn,
  checkOut,
  roomName,
  totalAmount,
}: BookingConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Confirmed! 🎉</Heading>
          <Text style={text}>
            Hello {guestName},
          </Text>
          <Text style={text}>
            Thank you for choosing Joebrown Palace Hotel and Suites. Your booking has been confirmed and we can't wait to host you!
          </Text>
          
          <Section style={detailsSection}>
            <Text style={detailText}><strong>Booking Reference:</strong> {bookingRef}</Text>
            <Text style={detailText}><strong>Room:</strong> {roomName}</Text>
            <Text style={detailText}><strong>Check-in:</strong> {checkIn}</Text>
            <Text style={detailText}><strong>Check-out:</strong> {checkOut}</Text>
            <Text style={detailText}><strong>Total Amount:</strong> ₦{totalAmount.toLocaleString()}</Text>
          </Section>

          <Hr style={hr} />
          
          <Text style={footer}>
            If you have any special requests or need to modify your booking, please reply to this email or chat with our Concierge via the website.
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
  border: '1px solid #fcd34d', // brown-300
  maxWidth: '600px',
};

const h1 = {
  color: '#b45309', // brown-700
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '20px 0',
};

const text = {
  color: '#334155', // slate-700
  fontSize: '16px',
  lineHeight: '24px',
};

const detailsSection = {
  backgroundColor: '#fef3c7', // brown-100
  padding: '20px',
  borderRadius: '8px',
  margin: '24px 0',
};

const detailText = {
  color: '#0f172a', // slate-900
  fontSize: '15px',
  margin: '8px 0',
};

const hr = {
  borderColor: '#fde68a', // brown-200
  margin: '20px 0',
};

const footer = {
  color: '#64748b', // slate-500
  fontSize: '14px',
  lineHeight: '22px',
};

export default BookingConfirmationEmail;
