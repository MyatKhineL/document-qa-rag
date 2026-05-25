"use client";

import { useState } from "react";

// Message shape — each message has a role and content
type Message = {
  role: "user" | "assistant";
  content: string;
};

// ChatBox component — lets the user ask questions about the uploaded document
export default function ChatBox() {
  // Store the full chat history (user + assistant messages)
  const [messages, setMessages] = useState<Message[]>([]);

  // Track the current input value
  const [input, setInput] = useState("");

  // Track loading state while waiting for the backend response
  const [loading, setLoading] = useState(false);

  // Called when the user submits a question
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const question = input.trim();
    if (!question) return;

    // Add the user's message to chat history immediately
    const userMessage: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);

    // Clear the input field
    setInput("");
    setLoading(true);

    try {
      // POST the question to FastAPI /ask endpoint
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (res.ok) {
        // Add the assistant's answer to chat history
        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // FastAPI returned an error
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Error: ${data.detail || "Something went wrong."}` },
        ]);
      }
    } catch {
      // Network error — backend not running or unreachable
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Cannot connect to backend. Is the server running?" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl flex flex-col border rounded-xl shadow-sm bg-white overflow-hidden">
      <h2 className="text-lg font-semibold p-4 border-b">Ask a Question</h2>

      {/* Chat message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          // Placeholder when no messages yet
          <p className="text-sm text-gray-400 text-center mt-8">
            Upload a PDF and ask a question to get started.
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"      // User bubble — right, blue
                  : "bg-gray-100 text-gray-800 rounded-bl-none"   // Assistant bubble — left, gray
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator while waiting for answer */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-2xl rounded-bl-none text-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input form at the bottom */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the document..."
          disabled={loading}
          className="flex-1 px-4 py-2 border rounded-lg text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
            hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
