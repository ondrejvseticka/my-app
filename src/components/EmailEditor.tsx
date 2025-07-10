// frontend/components/EmailEditor.tsx
"use client";
import { useRef, useState } from "react";
import EmailEditor, { EditorRef } from "react-email-editor";
import axios from "axios";

export default function CustomEmailEditor() {
  const emailEditorRef = useRef<EditorRef>(null);
  const [preview, setPreview] = useState<string>("");

  const exportHtml = async () => {
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.exportHtml(async (data) => {
      const { html, design } = data;
      try {
        // Send design JSON to backend to render with react-email
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/email/preview`,
          {
            design, // Send design JSON to backend
          }
        );
        setPreview(response.data.html);
      } catch (error) {
        console.error("Error rendering email:", error);
      }
    });
  };

  const onReady = () => {
    // Editor is ready, you can load a template if needed
    console.log("Email editor ready");
  };

  return (
    <div>
      <h2>Custom Email Editor</h2>
      <button onClick={exportHtml}>Preview Email</button>
      <EmailEditor ref={emailEditorRef} onReady={onReady} />
      {preview && (
        <div>
          <h3>Preview</h3>
          <iframe
            srcDoc={preview}
            style={{ width: "100%", height: "400px", border: "none" }}
          />
        </div>
      )}
    </div>
  );
}
