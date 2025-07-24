import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Button,
  Section,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface GroupInvitationEmailProps {
  inviterName?: string;
  groupName?: string;
  invitationUrl?: string;
  expiresAt?: string;
}

export const GroupInvitationEmail = ({
  inviterName = 'A friend',
  groupName = 'a group',
  invitationUrl = '#',
  expiresAt = 'soon',
}: GroupInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to join {groupName} on Settle</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo/Brand Section */}
        <Section style={logoSection}>
          <Text style={logoText}>Settle</Text>
          <Text style={taglineText}>Expense Splitting Made Simple</Text>
        </Section>
        <Heading style={h1}>You're invited to join a group!</Heading>
        
        <Text style={text}>
          <strong>{inviterName}</strong> has invited you to join the group{' '}
          <strong>"{groupName}"</strong> on Settle to help manage and split expenses together.
        </Text>
        
        <Section style={highlightBox}>
          <Text style={highlightText}>
            🎯 Track shared expenses<br/>
            💰 Split costs fairly<br/>
            📊 See who owes what<br/>
            ⚡ Settle up easily
          </Text>
        </Section>
        
        <Section style={buttonContainer}>
          <Button style={button} href={invitationUrl}>
            Accept Invitation
          </Button>
        </Section>
        
        <Text style={expiryText}>
          This invitation will expire on <strong>{expiresAt}</strong>. If you don't want to join this group, 
          you can safely ignore this email.
        </Text>
        
        <Hr style={hr} />
        
        <Text style={footerText}>
          If you're having trouble clicking the button, copy and paste this URL into your browser:
        </Text>
        <Text style={linkText}>{invitationUrl}</Text>
        
        <Text style={footerText}>
          This invitation was sent by Settle, your expense splitting companion.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default GroupInvitationEmail;

const main = {
  backgroundColor: '#fafafa',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  margin: '40px auto',
  padding: '40px',
  width: '500px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
};

const h1 = {
  color: '#1c1c1c',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center' as const,
  background: 'linear-gradient(135deg, #3ecf8e, #10b981)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const text = {
  color: '#1c1c1c',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '16px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3ecf8e',
  borderRadius: '10px',
  color: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 32px',
  boxShadow: '0 4px 14px 0 rgba(62, 207, 142, 0.25)',
  transition: 'all 0.2s ease',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderTop: 'none',
};

const footerText = {
  color: '#6b7280',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '18px',
  marginBottom: '8px',
};

const linkText = {
  color: '#3ecf8e',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '18px',
  marginBottom: '16px',
  wordBreak: 'break-all' as const,
};

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
  paddingBottom: '16px',
  borderBottom: '1px solid #f1f3f4',
};

const logoText = {
  color: '#3ecf8e',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 4px 0',
  letterSpacing: '-0.5px',
};

const taglineText = {
  color: '#6b7280',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const highlightBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e5e7eb',
  borderLeft: '4px solid #3ecf8e',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const highlightText = {
  color: '#1c1c1c',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
};

const expiryText = {
  color: '#6b7280',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  lineHeight: '22px',
  marginBottom: '16px',
  textAlign: 'center' as const,
};
