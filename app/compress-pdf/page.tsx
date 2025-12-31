import CompressPDFTool from "@/components/CompressPDFTool";
import { generateToolMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateToolMetadata("compress-pdf");

export default function CompressPDFPage() {
    return <CompressPDFTool />;
}
