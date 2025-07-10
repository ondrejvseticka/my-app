// src/components/EmailManager.tsx
"use client";
import { useState, useRef } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import EmailEditor, { EditorRef } from "react-email-editor";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  message: z.string().min(1, "Message is required"),
  to: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export default function EmailManager() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const [preview, setPreview] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const emailEditorRef = useRef<EditorRef>(null);

  const onPreview = async (data: FormData) => {
    try {
      // Try to get HTML from Unlayer editor first
      if (emailEditorRef.current?.editor) {
        emailEditorRef.current.editor.exportHtml(async (editorData) => {
          const { html } = editorData;
          setPreview(html);
          setStatus("");
        });
      } else {
        // Fallback to existing Welcome.tsx template
        const response = await axios.post("/api/email/preview", {
          username: data.username,
          message: data.message,
        });
        setPreview(response.data.html);
        setStatus("");
      }
    } catch (error) {
      setStatus("Failed to load preview");
    }
  };

  const onSend = async (data: FormData) => {
    try {
      let html = "";
      if (emailEditorRef.current && emailEditorRef.current.editor) {
        // Get HTML from Unlayer editor
        await new Promise<void>((resolve) => {
          emailEditorRef.current!.editor!.exportHtml((editorData) => {
            html = editorData.html;
            resolve();
          });
        });
      } else {
        // Fallback to Welcome.tsx template
        const response = await axios.post("/api/email/preview", {
          username: data.username,
          message: data.message,
        });
        html = response.data.html;
      }

      const response = await axios.post("/api/email/send", {
        ...data,
        html, // Include Unlayer or Welcome.tsx HTML
      });
      setStatus(response.data.message);
    } catch (error) {
      setStatus("Failed to send email");
    }
  };

  const onEditorReady = () => {
    const templateJson: any = {
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "text",
                    values: {
                      text: "Hello, {{username}}! {{message}}",
                    },
                  },
                  {
                    type: "button",
                    values: {
                      text: "Visit Dashboard",
                      href: "https://yourapp.com",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      counters: {
        text: 1,
        button: 1,
      },
    };
    emailEditorRef.current?.editor?.loadDesign(templateJson);
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "auto",
        padding: "20px",
        display: "flex",
        gap: "20px",
      }}
    >
      <div style={{ flex: 1 }}>
        <h1>Email Campaign Demo</h1>
        <form style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label>Recipient Email</label>
            <input {...register("to")} placeholder="recipient@example.com" />
            {errors.to && <p style={{ color: "red" }}>{errors.to.message}</p>}
          </div>
          <div>
            <label>Username</label>
            <input {...register("username")} placeholder="John Doe" />
            {errors.username && (
              <p style={{ color: "red" }}>{errors.username.message}</p>
            )}
          </div>
          <div>
            <label>Message</label>
            <textarea
              {...register("message")}
              placeholder="Thank you for joining!"
            />
            {errors.message && (
              <p style={{ color: "red" }}>{errors.message.message}</p>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={handleSubmit(onPreview)}
              style={{ marginRight: "10px" }}
            >
              Preview Email
            </button>
            <button type="button" onClick={handleSubmit(onSend)}>
              Send Email
            </button>
          </div>
        </form>
        {status && <p>{status}</p>}
      </div>
      <div style={{ flex: 2 }}>
        <h2>Drag-and-Drop Editor</h2>
        <EmailEditor
          ref={emailEditorRef}
          onReady={onEditorReady}
          style={{ height: "600px" }}
        />
        {preview && (
          <div>
            <h2>Preview</h2>
            <iframe
              srcDoc={preview}
              style={{
                width: "100%",
                height: "400px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
