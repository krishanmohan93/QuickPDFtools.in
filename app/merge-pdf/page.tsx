import MergePDFTool from "@/components/MergePDFTool";
import { generateToolMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateToolMetadata("merge-pdf");

export default function MergePDFPage() {
    return <MergePDFTool />;
}
