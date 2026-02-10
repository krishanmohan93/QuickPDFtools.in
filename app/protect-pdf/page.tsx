import ProtectPDFTool from "@/components/ProtectPDFTool";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Protect PDF - Add Password Protection | PDF Master Tools",
    description: "Secure your PDF documents with password protection. Add user and owner passwords, control permissions like printing, copying, and editing. Free online PDF protection tool.",
    keywords: ["protect pdf", "password protect pdf", "secure pdf", "encrypt pdf", "pdf security", "pdf permissions"],
};

export default function ProtectPDFPage() {
    return <ProtectPDFTool />;
}
