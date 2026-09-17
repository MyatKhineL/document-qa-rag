"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/lib/LocaleContext";
import { API_URL } from "@/lib/config";

// Render's free tier puts an idle backend to sleep; the first request after
// that can take 30-60s to wake it up. Anything past this is worth telling
// the user about instead of leaving them staring at "Uploading...".
const SLOW_WAKE_HINT_MS = 8000;
const UPLOAD_TIMEOUT_MS = 90000;

export default function FileUpload() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showWakeHint, setShowWakeHint] = useState(false);
  const wakeHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (wakeHintTimer.current) clearTimeout(wakeHintTimer.current);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setStatus("idle");
      setMessage("");
    } else {
      setFile(null);
      setMessage(t.errorPdf);
      setStatus("error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setMessage("");
    setShowWakeHint(false);

    wakeHintTimer.current = setTimeout(() => setShowWakeHint(true), SLOW_WAKE_HINT_MS);

    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(t.success(file.name));
      } else {
        setStatus("error");
        setMessage(data.detail || t.errorNetwork);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof DOMException && err.name === "AbortError" ? t.errorTimeout : t.errorNetwork);
    } finally {
      clearTimeout(timeout);
      if (wakeHintTimer.current) clearTimeout(wakeHintTimer.current);
      setShowWakeHint(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">{t.uploadTitle}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{t.uploadSub}</p>
      </div>

      {/* Drop zone — success state တွင် ✅ icon ပြ */}
      {status === "success" ? (
        <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-emerald-200
          bg-emerald-50 rounded-xl">
          <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-emerald-700">{file?.name}</span>
          <span className="text-xs text-emerald-500 mt-0.5">Uploaded successfully</span>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed
          border-slate-200 rounded-xl cursor-pointer hover:border-[#1E40AF] hover:bg-blue-50 transition-colors">
          <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 16v-8m0 0-3 3m3-3 3 3M6 20h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-slate-400">
            {file ? file.name : t.uploadZone}
          </span>
          <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
        </label>
      )}

      {/* Upload button — success ဖြစ်ရင် မပြ */}
      {status !== "success" && (
        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
          className="mt-4 w-full py-2.5 bg-[#1E40AF] text-white text-sm font-semibold rounded-xl
            hover:bg-[#1e3a8a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === "uploading" ? t.uploading : status === "error" ? t.retry : t.uploadBtn}
        </button>
      )}

      {/* Cold-start hint — 8 seconds ကျော်ပြီးတော့လည်း uploading ဖြစ်နေရင် ပြ */}
      {status === "uploading" && showWakeHint && (
        <div className="mt-3 px-4 py-3 rounded-xl text-sm bg-blue-50 text-blue-600">
          {t.wakeHint}
        </div>
      )}

      {/* Error message သာ ပြ — success box အစား drop zone ထဲမှာ ပြပြီ */}
      {status === "error" && message && (
        <div className="mt-4 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600">
          {message}
        </div>
      )}
    </div>
  );
}
