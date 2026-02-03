import { Metadata } from "next";
import MergePDFPage from "@/components/MergePDFPage";
import { generateToolMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateToolMetadata("merge-pdf");

export default function MergePDF() {
    return <MergePDFPage />;
}
