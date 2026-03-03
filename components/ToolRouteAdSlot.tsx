"use client";

import { usePathname } from "next/navigation";
import AdsterraAdUnit from "@/components/AdsterraAdUnit";

const TOOL_ROUTES = new Set([
  "/compress-pdf",
  "/edit-pdf",
  "/excel-to-pdf",
  "/jpg-to-pdf",
  "/merge-pdf",
  "/pdf-to-excel",
  "/pdf-to-jpg",
  "/pdf-to-png",
  "/pdf-to-ppt",
  "/pdf-to-word",
  "/png-to-pdf",
  "/protect-pdf",
  "/reorder-pdf",
  "/rotate-pdf",
  "/split-pdf",
  "/unlock-pdf",
  "/word-to-pdf",
  "/convert-python-jupyter-to-pdf",
]);

export default function ToolRouteAdSlot() {
  const pathname = usePathname();
  const normalizedPath = pathname?.replace(/\/$/, "") || "";

  if (!TOOL_ROUTES.has(normalizedPath)) {
    return null;
  }

  return (
    <section className="py-8 bg-white transition-colors duration-300">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16">
        <AdsterraAdUnit />
      </div>
    </section>
  );
}
