import PDFToImageTool from "@/components/PDFToImageTool";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "PDF to JPG - Convert PDF Pages to JPG Images | PDF Master Tools",
    description: "Convert PDF pages to high-quality JPG images online. Free PDF to JPG converter with adjustable quality and resolution settings. Download each page as a separate JPG file.",
    keywords: ["pdf to jpg", "pdf to jpeg", "convert pdf to jpg", "pdf to image", "pdf converter"],
};

export default function PDFToJPGPage() {
    return <PDFToImageTool format="jpg" />;
}
