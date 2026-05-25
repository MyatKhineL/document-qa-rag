// Translation dictionary for EN and JP
export const translations = {
  en: {
    badge: "Powered by GPT-4o-mini · RAG Technology",
    title: "Instant AI answers from your documents.",
    subtitle: "Upload a PDF and get instant AI-powered answers from your content.",
    footer: "Enterprise-grade security · No data stored · Built with LangChain + FAISS",
    uploadTitle: "Upload Document",
    uploadSub: "PDF files only",
    uploadZone: "Click to choose a PDF",
    uploadBtn: "Upload & Process",
    uploading: "Uploading...",
    chatTitle: "Ask a Question",
    chatSub: "Ask anything about your uploaded document",
    chatPlaceholder: "Ask a question about the document...",
    send: "Send",
    empty: "Upload a PDF first, then ask your question.",
    success: (name: string) => `'${name}' uploaded and ingested successfully.`,
    errorPdf: "Please select a valid PDF file.",
    errorNetwork: "Cannot connect to backend. Is the server running?",
  },
  ja: {
    badge: "GPT-4o-mini · RAGテクノロジー搭載",
    title: "社内文書に、AIで即答。",
    subtitle: "PDFをアップロードして、ドキュメントに関する質問に即座にAIが回答します。",
    footer: "企業の機密文書も安全に処理 · データ保存なし · LangChain + FAISS",
    uploadTitle: "ドキュメントをアップロード",
    uploadSub: "PDFファイルのみ対応",
    uploadZone: "クリックしてPDFを選択",
    uploadBtn: "アップロードして処理",
    uploading: "アップロード中...",
    chatTitle: "質問する",
    chatSub: "アップロードしたドキュメントについて何でも聞いてください",
    chatPlaceholder: "ドキュメントについて質問してください...",
    send: "送信",
    empty: "まずPDFをアップロードしてから質問してください。",
    success: (name: string) => `'${name}' のアップロードと処理が完了しました。`,
    errorPdf: "有効なPDFファイルを選択してください。",
    errorNetwork: "バックエンドに接続できません。サーバーは起動していますか？",
  },
};

export type Locale = keyof typeof translations;
export type Translations = typeof translations.en;
