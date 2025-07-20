"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, MoveUp, MoveDown, Eye } from "lucide-react";
import axios from "axios";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";
import { render } from "@react-email/render";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  message: z.string().min(1, "Message is required"),
  to: z.string().email("Invalid email address"),
});

// Define available components (simplified for this example)
const availableComponents = [
  {
    id: "welcome_header",
    name: "Welcome Header",
    description: "Header with welcome message",
    preview: "🎉 Welcome Header",
  },
  // Add other components as needed
];

type FormData = z.infer<typeof formSchema>;
type ComponentInstance = {
  id: string;
  componentId: string;
  order: number;
};

const WelcomeHeader = ({
  username,
  message,
}: {
  username: string;
  message: string;
}) => (
  <Section style={{ backgroundColor: "red" }}>
    <Text style={{ fontSize: "14px", lineHeight: "24px", margin: "16px 0" }}>
      Hello, {username || "User"}!
    </Text>
    <Text style={{ fontSize: "14px", lineHeight: "24px", margin: "16px 0" }}>
      {message || "Welcome to our platform!"}
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
);

const renderComponent = (
  componentId: string,
  username?: string,
  message?: string,
) => {
  switch (componentId) {
    case "welcome_header":
      return (
        <WelcomeHeader username={username ?? ""} message={message ?? ""} />
      );
    default:
      return <div>Component not found</div>;
  }
};

const EmailTemplate = ({
  components,
  username,
  message,
}: {
  components: ComponentInstance[];
  username: string;
  message: string;
}) => (
  <Html lang="en">
    <Head>
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
      {/*[if mso]>
        <style type="text/css">
          table { border-collapse: collapse; border-spacing: 0; }
          td, p, a { font-family: Arial, Helvetica, sans-serif !important; }
          a { text-decoration: none !important; }
        </style>
      <![endif]*/}
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
        {components.map((comp) => (
          <div key={comp.id}>
            {renderComponent(comp.componentId, username, message)}
          </div>
        ))}
      </Container>
    </Body>
  </Html>
);

export default function CustomEmailBuilder() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "John Doe",
      message: "Welcome to our amazing platform!",
      to: "user@example.com",
    },
  });

  const [components, setComponents] = useState<ComponentInstance[]>([]);
  const [status, setStatus] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  const watchedValues = watch();

  const addComponent = (componentId: string) => {
    const newComponent: ComponentInstance = {
      id: Date.now().toString(),
      componentId,
      order: components.length,
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter((comp) => comp.id !== id));
  };

  const moveComponent = (id: string, direction: "up" | "down") => {
    const index = components.findIndex((comp) => comp.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === components.length - 1)
    )
      return;

    const newComponents = [...components];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newComponents[index], newComponents[targetIndex]] = [
      newComponents[targetIndex],
      newComponents[index],
    ];
    setComponents(newComponents);
  };

  const generateEmailHTML = (data: FormData) => {
    const sortedComponents = components.sort((a, b) => a.order - b.order);
    return render(
      <EmailTemplate
        components={sortedComponents}
        username={data.username}
        message={data.message}
      />,
      { pretty: true },
    );
  };

  const onSend = async (data: FormData) => {
    if (components.length === 0) {
      setStatus("Please add at least one component to your email!");
      return;
    }

    try {
      setStatus("Sending email...");
      const emailHTML = await generateEmailHTML(data);
      console.log("emailHtml", emailHTML);
      console.log("Generated HTML:", emailHTML); // Debug

      await axios.post("/api/email/send", {
        ...data,
        html: emailHTML,
        to: data.to,
      });

      setStatus(
        `Email successfully sent to ${data.to} with ${components.length} components!`,
      );
    } catch (error) {
      console.error("Email send error:", error);
      setStatus("Failed to send email. Check console for details.");
    }
  };

  const openPreview = () => {
    if (components.length === 0) {
      setStatus("Add components to see preview!");
      return;
    }
    setPreviewMode(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Custom Email Builder
          </h1>
          <p className="text-gray-600">
            Build beautiful emails with predefined components
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <div className="lg:w-1/4 space-y-6">
            {/* Email Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Email Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    {...register("to")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="recipient@example.com"
                  />
                  {errors.to && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.to.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    {...register("username")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Welcome Message
                  </label>
                  <textarea
                    {...register("message")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Welcome to our platform!"
                    rows={3}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.message.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Available Components */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Components Library
              </h2>
              <div className="space-y-3">
                {availableComponents.map((component) => (
                  <div
                    key={component.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">{component.preview}</span>
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm mb-1">
                      {component.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {component.description}
                    </p>
                    <button
                      onClick={() => addComponent(component.id)}
                      className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Add Component
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={openPreview}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Preview Email
                </button>
                <button
                  onClick={handleSubmit(onSend)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => setComponents([])}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>
              {status && (
                <div
                  className={`mt-4 p-3 rounded-md text-sm ${
                    status.includes("Failed") || status.includes("Please add")
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : status.includes("Sending")
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  {status}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Email Builder
                    </h2>
                    <p className="text-sm text-gray-600">
                      {components.length} component
                      {components.length !== 1 ? "s" : ""} added
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Live Preview</span>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {components.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">📧</div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      Start Building Your Email
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Add components from the sidebar to start creating your
                      email
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {components.map((comp, index) => {
                      const componentDef = availableComponents.find(
                        (c) => c.id === comp.componentId,
                      );
                      return (
                        <div
                          key={comp.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {componentDef?.name || "Unknown Component"}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveComponent(comp.id, "up")}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MoveUp size={16} />
                              </button>
                              <button
                                onClick={() => moveComponent(comp.id, "down")}
                                disabled={index === components.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MoveDown size={16} />
                              </button>
                              <button
                                onClick={() => removeComponent(comp.id)}
                                className="p-1 text-red-400 hover:text-red-600 ml-2"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="bg-white p-4">
                            {renderComponent(
                              comp.componentId,
                              watchedValues.username,
                              watchedValues.message,
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">Email Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const emailHTML = await generateEmailHTML(watchedValues);
                    const blob = new Blob([emailHTML], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "email-preview.html";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Download HTML
                </button>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="max-w-[37.5em] mx-auto bg-white">
                {components.map((comp) => (
                  <div key={comp.id}>
                    {renderComponent(
                      comp.componentId,
                      watchedValues.username,
                      watchedValues.message,
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
