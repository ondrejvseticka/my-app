import { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

import { cors } from "../../../middleware/cors";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await new Promise<void>((resolve) => cors(req, res, resolve));

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { to, html } = req.body as {
    username?: string;
    message?: string;
    to?: string;
    html?: string;
  };

  if (!to) {
    return res.status(400).json({ error: "Missing required field: to" });
  }

  try {
    if (!html) {
      throw new Error("No html was provided to send email");
    }

    const { data, error } = await resend.emails.send({
      from: "Demo App <no-reply@rubujakcyp.online>",
      to: [to],
      subject: "Welcome to Our Platform!",
      html,
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
