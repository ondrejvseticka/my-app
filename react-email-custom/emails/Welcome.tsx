import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";

export default function WelcomeEmail({
  username = "User",
  message = "Welcome to our platform!",
}) {
  return (
    <Html lang="en">
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
      </Head>
      <Body
        style={{
          fontFamily: "Arial, sans-serif",
          padding: "20px",
          backgroundColor: "#ffffff",
          margin: 0,
        }}
      >
        <Container
          style={{ maxWidth: "37.5em", margin: "0 auto", width: "100%" }}
        >
          <Section>
            <Text
              style={{ fontSize: "14px", lineHeight: "24px", margin: "16px 0" }}
            >
              Hello, {username}!
            </Text>
            <Text
              style={{ fontSize: "14px", lineHeight: "24px", margin: "16px 0" }}
            >
              {message}
            </Text>
            <Button
              href="https://rubujakcyp.online"
              style={{
                backgroundColor: "#007bff",
                color: "#ffffff",
                padding: "10px 20px",
                textDecoration: "none",
                display: "inline-block",
                maxWidth: "100%",
                fontSize: "14px",
                lineHeight: "100%",
                textAlign: "center",
              }}
            >
              Visit rubujakcyp.online
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
