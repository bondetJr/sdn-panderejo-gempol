"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FaqItem = { id: string; pertanyaan: string; jawaban: string };

export function FaqAccordion({ faq }: { faq: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faq[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {faq.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-card bg-white shadow-soft"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-teal/10 text-primary-teal-deep">
                  <HelpCircle className="h-4 w-4" />
                </span>
                <span className="text-sm font-bold text-neutral-espresso">
                  {item.pertanyaan}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-neutral-slate transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="border-t border-neutral-espresso/10 px-5 py-4 pl-16">
                <p className="text-sm leading-relaxed text-neutral-espresso/80">
                  {item.jawaban}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
