import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";
import { render } from "@react-email/render";
import sanitizeHtml from "sanitize-html";
import WelcomeEmail from "../../../../react-email-custom/emails/Welcome";
import { cors } from "../../../middleware/cors";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware
  await new Promise<void>((resolve) => cors(req, res, resolve));

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

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
    let emailHtml =
      html ||
      render(<WelcomeEmail username={username || "User"} message={message} />);
    if (html && username && message) {
      emailHtml = sanitizeHtml(
        html
          .replace("{{username}}", username || "User")
          .replace("{{message}}", message || ""),
        {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "img",
            "a",
            "span",
          ]),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            a: ["href", "target"],
            img: ["src", "alt"],
          },
        }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Demo App <no-reply@rubujakcyp.online>",
      to: [to],
      subject: "Welcome to Our Platform!",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return res
        .status(500)
        .json({ error: "Failed to send email", details: error });
    }

    res.status(200).json({ message: "Email sent successfully", data });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Server error", details: error });
  }
}
