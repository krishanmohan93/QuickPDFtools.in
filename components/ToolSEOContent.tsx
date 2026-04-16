"use client";

import { useState } from "react";
import SEO_CONTENT from "@/lib/seoContent";

interface ToolSEOContentProps {
  toolId: string;
}

export default function ToolSEOContent({ toolId }: ToolSEOContentProps) {
  const data = SEO_CONTENT[toolId];
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* ── 1. What is … ───────────────────────────────────────────────── */}
      <section aria-labelledby={`${toolId}-what`}>
        <h2
          id={`${toolId}-what`}
          className="text-3xl font-bold text-gray-900 mb-5 tracking-tight"
        >
          {data.whatTitle}
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
          {data.whatBody}
        </p>
      </section>

      {/* ── 2. When Should You … ───────────────────────────────────────── */}
      <section aria-labelledby={`${toolId}-when`}>
        <h2
          id={`${toolId}-when`}
          className="text-3xl font-bold text-gray-900 mb-8 tracking-tight"
        >
          {data.whenTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.useCases.map((uc) => (
            <div
              key={uc.title}
              className="flex gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100
                         hover:shadow-md transition-shadow duration-200"
            >
              <span className="text-3xl shrink-0 mt-0.5" aria-hidden="true">
                {uc.icon}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {uc.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {uc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Step-by-Step ────────────────────────────────────────────── */}
      <section aria-labelledby={`${toolId}-steps`}>
        <h2
          id={`${toolId}-steps`}
          className="text-3xl font-bold text-gray-900 mb-8 tracking-tight"
        >
          {data.stepsTitle}
        </h2>
        <ol className="space-y-5" role="list">
          {data.steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-5 items-start p-6 bg-white rounded-2xl
                         border border-gray-100 shadow-sm
                         hover:shadow-md transition-shadow duration-200"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center
                           rounded-full bg-blue-600 text-white font-bold text-lg
                           shadow"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 4. FAQ Accordion ───────────────────────────────────────────── */}
      <section aria-labelledby={`${toolId}-faq`}>
        <h2
          id={`${toolId}-faq`}
          className="text-3xl font-bold text-gray-900 mb-8 tracking-tight"
        >
          {data.faqTitle}
        </h2>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
          {data.faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* ── 5. Why QuickPDFTools ───────────────────────────────────────── */}
      <section aria-labelledby={`${toolId}-why`}>
        <h2
          id={`${toolId}-why`}
          className="text-3xl font-bold text-gray-900 mb-8 tracking-tight"
        >
          {data.whyTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center p-8 bg-white rounded-2xl border border-gray-100
                         shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <span
                className="block text-5xl mb-4"
                aria-hidden="true"
              >
                {benefit.icon}
              </span>
              <h3 className="font-bold text-gray-900 text-base mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ── Accordion item (self-contained so the parent can stay a Server Component) */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5
                   text-left text-gray-900 font-semibold text-base
                   hover:bg-gray-50 focus:outline-none focus-visible:ring-2
                   focus-visible:ring-blue-500 transition-colors duration-150"
      >
        <span>{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-blue-600 transition-transform duration-300
                      ${open ? "rotate-180" : "rotate-0"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50">
          <p className="pt-3">{answer}</p>
        </div>
      )}
    </div>
  );
}
