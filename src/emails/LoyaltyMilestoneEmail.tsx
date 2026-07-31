import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Hr,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface LoyaltyMilestoneEmailProps {
  guestName: string;
  points: number;
}

export const LoyaltyMilestoneEmail = ({
  guestName,
  points,
}: LoyaltyMilestoneEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Congratulations! 🏆</Heading>
          <Text style={text}>
            Hello {guestName},
          </Text>
          <Text style={text}>
            You just hit a major milestone! You've successfully collected <strong>{points.toLocaleString()} Loyalty Points</strong> at Joebrown Palace Hotel and Suites.
          </Text>
          <Text style={text}>
            As a token of our appreciation, please show this email to our staff during your next visit to claim a complimentary signature cocktail or mocktail on the house! 🥂
          </Text>

          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button href="https://joebrown.com/menu" style={button}>
              View Our Menu
            </Button>
          </div>

          <Text style={text}>
            Thank you for being a valued guest. We look forward to celebrating with you!
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
const button = { backgroundColor: '#b45309', color: '#fff', padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' };
const hr = { borderColor: '#fde68a', margin: '20px 0' };
const footer = { color: '#64748b', fontSize: '14px', lineHeight: '22px' };

export default LoyaltyMilestoneEmail;
