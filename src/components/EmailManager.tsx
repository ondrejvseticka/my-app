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

  const [status, setStatus] = useState<string>("");
  const emailEditorRef = useRef<EditorRef>(null);

  const onSend = async (data: FormData) => {
    try {
      let html = "";
      if (emailEditorRef.current?.editor) {
        await new Promise<void>((resolve) => {
          emailEditorRef.current!.editor!.exportHtml((editorData) => {
            html = editorData.html;
            resolve();
          });
        });
      } else {
        const response = await axios.post("/api/email/preview", {
          username: data.username,
          message: data.message,
        });
        html = response.data.html;
      }

      const response = await axios.post("/api/email/send", {
        ...data,
        html,
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
    <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 max-w-7xl">
      <div className="lg:w-1/3 bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Email Campaign Demo
        </h1>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email
            </label>
            <input
              {...register("to")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="recipient@example.com"
            />
            {errors.to && (
              <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              {...register("username")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="John Doe"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              {...register("message")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Thank you for joining!"
              rows={4}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">
                {errors.message.message}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit(onSend)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              Send Email
            </button>
          </div>
          {status && (
            <p
              className={`mt-4 text-sm ${
                status.includes("Failed") ? "text-red-600" : "text-green-600"
              }`}
            >
              {status}
            </p>
          )}
        </form>
      </div>
      <div className="lg:w-2/3">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Drag-and-Drop Editor
        </h2>
        <EmailEditor
          ref={emailEditorRef}
          onReady={onEditorReady}
          style={{ height: "600px" }}
        />
      </div>
    </div>
  );
}
