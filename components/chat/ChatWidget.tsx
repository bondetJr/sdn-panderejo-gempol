"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { SchoolLogo } from "@/components/layout/SchoolLogo";
import type { SchoolProfile } from "@/lib/school";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK = ["Syarat PPDB apa saja?", "Fasilitas Sekolah", "Cek Status PPDB?"];

export function ChatWidget({ school }: { school: SchoolProfile }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [msgs]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed with status ${res.status}`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      setMsgs([...history, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value);
        setMsgs([...history, { role: "assistant", content: acc }]);
      }
    } catch {
      setMsgs([...history, { role: "assistant", content: "Maaf, koneksi gagal. Cek GROQ_API_KEY." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) =>!o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-emerald-500 text-white shadow-[0_10px_30px_-10px_rgba(13,148,136,0.6)] transition-all hover:scale-105"
      >
        <span className="absolute inset-0 rounded-full bg-teal-600 animate-ping opacity-20" />
        {open? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-130 w-95 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-card border border-white/60 bg-white/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
          {/* Header */}
          <div className="relative flex h-20 items-center gap-3 bg-linear-to-br from-teal-700 to-emerald-600 px-5">
            <SchoolLogo
              logoUrl={school.logoUrl}
              alt={`Logo ${school.nama}`}
              size={40}
              className="bg-white/20"
              iconClassName="text-white"
            />
            <div className="flex-1">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                Ceria <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#6ee7b7] animate-pulse" />
              </p>
              <p className="text-xs text-white/70">Asisten Digital SDN Panderejo Gempol</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={ref} className="flex-1 space-y-4 overflow-y-auto bg-[#f8fafc] p-5">
            {msgs.length === 0 && (
              <div className="rounded-2xl rounded-bl-md bg-white p-4 text-[13.5px] leading-relaxed text-slate-700 shadow-sm ring-1 ring-black/4">
                Halo Bapak/Ibu! 👋 Saya <b>Ceria</b>, siap bantu jawab seputar PPDB, fasilitas, dan kegiatan sekolah. Ada yang bisa saya bantu?
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user"? "ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-linear-to-br from-teal-600 to-emerald-500 px-4 py-3 text-[13.5px] text-white shadow-md" : "max-w-[82%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[13.5px] text-slate-700 shadow-sm ring-1 ring-black/4"}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2.5 shadow-sm ring-1 ring-black/4">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.3s]" />
              </div>
            )}
          </div>

          {/* Quick */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-4 py-2.5">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-600 hover:text-white">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 bg-white p-3">
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tanya Ceria..." className="flex-1 rounded-full bg-slate-100 px-4 py-3 text-[13.5px] outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30" />
              <button type="submit" disabled={loading ||!input.trim()} className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-br from-teal-600 to-emerald-500 text-white shadow-lg disabled:opacity-40">
                {loading? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
            <p className="pt-2 text-center text-[11px] text-slate-400">Ceria bisa salah, cek info penting ke admin sekolah.</p>
          </div>
        </div>
      )}
    </>
  );
}