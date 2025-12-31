import SplitPDFTool from "@/components/SplitPDFTool";
import { generateToolMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateToolMetadata("split-pdf");

export default function SplitPDFPage() {
    return <SplitPDFTool />;
}
