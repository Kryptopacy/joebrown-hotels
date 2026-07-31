import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Section,
} from '@react-email/components';
import * as React from 'react';

interface BookingCancellationEmailProps {
  guestName: string;
  bookingRef: string;
}

export const BookingCancellationEmail = ({
  guestName,
  bookingRef,
}: BookingCancellationEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking Cancelled</Heading>
          <Text style={text}>
            Hello {guestName},
          </Text>
          <Text style={text}>
            We are writing to confirm that your booking (Ref: <strong>{bookingRef}</strong>) has been successfully cancelled.
          </Text>
          <Text style={text}>
            If you made a payment towards this booking, our management team will process any applicable refunds according to our cancellation policy. 
          </Text>
          <Text style={text}>
            We're sorry we won't be seeing you this time, but we hope to have the opportunity to host you at Joebrown Palace Hotel and Suites in the future.
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
const hr = { borderColor: '#fde68a', margin: '20px 0' };
const footer = { color: '#64748b', fontSize: '14px', lineHeight: '22px' };

export default BookingCancellationEmail;
