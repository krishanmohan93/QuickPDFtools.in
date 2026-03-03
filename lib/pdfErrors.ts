export const ENCRYPTED_PDF_MESSAGE =
    "This PDF appears to be encrypted or password-protected. Please unlock it and try again.";

export function isPdfLibEncryptedError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return message.includes("pdfdocument.load") && message.includes("encrypted");
}

export function getPdfLibUserMessage(error: unknown): string | null {
    if (isPdfLibEncryptedError(error)) {
        return ENCRYPTED_PDF_MESSAGE;
    }
    return null;
}
