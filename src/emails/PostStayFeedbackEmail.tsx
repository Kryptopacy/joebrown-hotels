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

interface PostStayFeedbackEmailProps {
  guestName: string;
}

export const PostStayFeedbackEmail = ({
  guestName,
}: PostStayFeedbackEmailProps) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://joebrown.com';
  
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thank You for Staying With Us!</Heading>
          <Text style={text}>
            Hello {guestName},
          </Text>
          <Text style={text}>
            We hope you enjoyed your time at Joebrown Palace Hotel and Suites. Our team loved having you!
          </Text>
          <Text style={text}>
            We are constantly striving to provide the best possible experience for our guests. We would deeply appreciate it if you could take 60 seconds to share your thoughts on your stay.
          </Text>
          
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button href={`${appUrl}/feedback`} style={button}>
              Leave Feedback
            </Button>
          </div>

          <Text style={text}>
            We hope to welcome you back again very soon.
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

export default PostStayFeedbackEmail;
