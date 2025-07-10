// src/pages/api/email/preview.tsx
import { NextApiRequest, NextApiResponse } from "next";
import { render } from "@react-email/render";
import WelcomeEmail from "../../../../react-email-custom/emails/Welcome";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { username, message } = req.body as {
      username?: string;
      message?: string;
    };
    try {
      const html = render(
        <WelcomeEmail username={username || "User"} message={message} />
      );
      res.status(200).json({ html });
    } catch (error) {
      res.status(500).json({ error: "Failed to render email" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
