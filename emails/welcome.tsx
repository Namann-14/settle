import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  userFirstname?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const WelcomeEmail = ({
  userFirstname = 'there',
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Settle - Your expense splitting companion</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Settle!</Heading>
        <Text style={text}>
          Hi {userFirstname},
        </Text>
        <Text style={text}>
          Welcome to Settle, the easy way to split expenses with friends and family.
          Start by creating your first group or adding a personal expense.
        </Text>
        <Text style={text}>
          Get started by visiting your dashboard and exploring the features.
        </Text>
        <Text style={text}>
          Happy expense tracking!
          <br />
          The Settle Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '15px',
};
