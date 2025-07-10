// src/pages/api/email/send.tsx
import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "../../../../react-email-custom/emails/Welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { username, message, to, html } = req.body as {
      username?: string;
      message?: string;
      to?: string;
      html?: string;
    };
    if (!to || (!username && !html)) {
      return res.status(400).json({
        error: "Missing required fields: to and either username or html",
      });
    }
    try {
      const emailHtml =
        html ||
        render(
          <WelcomeEmail username={username || "User"} message={message} />
        );
      const { data, error } = await resend.emails.send({
        from: "Demo App <no-reply@yourdomain.com>",
        to: [to],
        subject: "Welcome to Our Platform!",
        html: emailHtml,
      });
      console.log(error);
      if (error) {
        return res.status(500).json({ error: "Failed to send email" });
      }
      res.status(200).json({ message: "Email sent successfully", data });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
