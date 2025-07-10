// frontend/components/EmailPreview.tsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface EmailPreviewProps {
  username: string;
}

export default function EmailPreview({ username }: EmailPreviewProps) {
  const [emailHtml, setEmailHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/email/preview`,
          { username }
        );
        setEmailHtml(response.data.html);
      } catch (err) {
        setError("Failed to load email preview");
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, [username]);

  if (loading) return <div>Loading preview...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
      }}
    >
      <h2>Email Preview</h2>
      <iframe
        srcDoc={emailHtml}
        style={{ width: "100%", height: "400px", border: "none" }}
        title="Email Preview"
      />
    </div>
  );
}
