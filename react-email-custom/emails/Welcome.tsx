// src/react-email-custom/emails/Welcome.tsx
import {
  Button,
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  username: string;
  message?: string;
}

export default function WelcomeEmail({
  username,
  message = "Thank you for joining our platform!",
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform!</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
        <Container>
          <Section>
            <Text>Hello, {username}!</Text>
            <Text>{message}</Text>
            <Button
              href="https://yourapp.com"
              style={{
                background: "#007bff",
                color: "#fff",
                padding: "10px 20px",
              }}
            >
              Visit Dashboard
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
