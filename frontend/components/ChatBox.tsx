"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/lib/LocaleContext";

type Source = {
  page: number;
  snippet: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function ChatBox() {
  const { t } = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-scroll to bottom on new message
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.ok ? data.answer : (data.detail || t.errorNetwork),
          sources: res.ok ? data.sources : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t.errorNetwork },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden"
      style={{ height: "480px" }}>

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-800">{t.chatTitle}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{t.chatSub}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400">{t.empty}</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-[#1E40AF] text-white rounded-br-none"
                : "bg-slate-100 text-slate-700 rounded-bl-none"
            }`}>
              {msg.content}
            </div>

            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
              <div className="max-w-[75%] mt-1.5 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                  {t.sourcesLabel}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {msg.sources.map((source, j) => (
                    <span
                      key={j}
                      title={source.snippet}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[11px] text-slate-500 cursor-help"
                    >
                      {t.pageLabel(source.page)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-slate-100 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chatPlaceholder}
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent
            disabled:opacity-50 placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-[#1E40AF] text-white rounded-xl text-sm font-semibold
            hover:bg-[#1e3a8a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {t.send}
        </button>
      </form>
    </div>
  );
}
