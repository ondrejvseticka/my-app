// frontend/components/SendEmail.tsx
"use client";
import { useState } from "react";
import axios from "axios";

export default function SendEmail() {
  const [to, setTo] = useState<string>("");
  const [username, setUsername] = useState<string>("John Doe");
  const [status, setStatus] = useState<string>("");

  const sendEmail = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/email/send`,
        {
          username,
          to,
        }
      );
      setStatus("Email sent successfully!");
    } catch (error) {
      setStatus("Failed to send email.");
    }
  };

  return (
    <div>
      <h2>Send Email</h2>
      <input
        type="email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Recipient email"
      />
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button onClick={sendEmail}>Send Email</button>
      {status && <p>{status}</p>}
    </div>
  );
}
