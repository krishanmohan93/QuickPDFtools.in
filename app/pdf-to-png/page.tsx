import PDFToImageTool from "@/components/PDFToImageTool";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "PDF to PNG - Convert PDF Pages to PNG Images | PDF Master Tools",
    description: "Convert PDF pages to high-quality PNG images online. Free PDF to PNG converter with adjustable resolution settings. Download each page as a separate PNG file.",
    keywords: ["pdf to png", "convert pdf to png", "pdf to image", "pdf converter", "png converter"],
};

export default function PDFToPNGPage() {
    return <PDFToImageTool format="png" />;
}
