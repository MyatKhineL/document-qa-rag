"use client";

import FileUpload from "@/components/FileUpload";
import ChatBox from "@/components/ChatBox";
import { useLocale } from "@/lib/LocaleContext";

export default function Home() {
  const { locale, t, toggle } = useLocale();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-4">

        {/* EN / JP toggle — top right */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200
              bg-white text-sm font-semibold text-slate-700 hover:border-[#1E40AF]
              hover:text-[#1E40AF] transition-colors shadow-sm"
          >
            <span className="text-base">{locale === "en" ? "🇯🇵" : "🇺🇸"}</span>
            {locale === "en" ? "日本語" : "English"}
          </button>
        </div>

        {/* Hero section */}
        <div className="mb-6">

          {/* Badge */}
          {/* <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50
            text-[#1E40AF] text-xs font-semibold mb-4 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] animate-pulse" />
            {t.badge}
          </span> */}

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-900 mb-3 leading-tight">
            {locale === "ja" ? (
              <>社内文書に、<span className="text-[#1E40AF]">AI</span>で即答。</>
            ) : (
              <>Instant <span className="text-[#1E40AF]">AI</span> answers from your documents.</>
            )}
          </h1>

          <p className="text-slate-500 text-lg">{t.subtitle}</p>

          {/* Tech stack note + developer credit */}
          <p className="text-md text-slate-400 mt-3">{t.footer}</p>
          {/* <p className="text-xs text-slate-400 mt-1">
            Developed by <span className="font-semibold text-slate-500">MyatKhine Lin</span>
          </p> */}
        </div>

        {/* Side by side cards */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="w-full lg:w-[360px] shrink-0">
            <FileUpload />
          </div>
          <div className="w-full flex-1">
            <ChatBox />
          </div>
        </div>

        {/* Footer — developer credit */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col items-center gap-1">
          <p className="text-xs text-slate-400 tracking-widest uppercase">Developed by</p>
          <p className="text-sm font-semibold text-slate-700 tracking-wide">Myat Khine Lin</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {locale === "ja" ? "AIエンジニア · フルスタック開発者" : "AI Engineer · Full Stack Developer"}
          </p>
        </div>

      </div>
    </main>
  );
}
