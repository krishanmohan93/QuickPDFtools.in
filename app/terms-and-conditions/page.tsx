
import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Terms and Conditions | " + SITE_NAME,
    description: "Terms and Conditions of use for " + SITE_NAME + ". Understanding your rights and responsibilities when using our free PDF tools.",
};

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
                <p className="text-gray-600 mb-8"><strong>Last Updated:</strong> January 1, 2024</p>

                <div className="prose prose-lg prose-blue text-gray-700 max-w-none">
                    <p>
                        Please read these Terms and Conditions ("Terms", "Terms and Conditions") carefully before using the {SITE_URL} website (the "Service") operated by {SITE_NAME} ("us", "we", or "our").
                    </p>
                    <p>
                        Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service you agree to be bound by these Terms.
                    </p>

                    <h3>1. Usage of Services</h3>
                    <p>
                        {SITE_NAME} provides online tools for PDF manipulation (merging, splitting, converting, compressing, etc.). You agree to use these services only for lawful purposes. You are strictly prohibited from:
                    </p>
                    <ul>
                        <li>Uploading any content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy.</li>
                        <li>Uploading malicious software, viruses, or code designed to disrupt, damage, or gain unauthorized access to computer systems.</li>
                        <li>Attempting to interfere with the proper working of the Service, including overloading our servers.</li>
                    </ul>

                    <h3>2. Intellectual Property</h3>
                    <p>
                        The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of {SITE_NAME} and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                    </p>

                    <h3>3. User Content</h3>
                    <p>
                        You retain all rights to any files you upload to {SITE_NAME}. We do not claim ownership of your content. By uploading documents, you grant us a worldwide, non-exclusive, royalty-free license to host, copy, and process the content solely for the purpose of providing the Service to you (e.g., converting the file). This license terminates immediately upon the deletion of your content from our servers.
                    </p>

                    <h3>4. Limitations of Liability</h3>
                    <p>
                        In no event shall {SITE_NAME}, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory.
                    </p>
                    <p>
                        <strong>Specifically, we are not responsible for:</strong>
                    </p>
                    <ul>
                        <li>Any loss of data or corruption of files processed through our Service. Please always keep a backup of your original files.</li>
                        <li>Any errors or inaccuracies in the conversion results.</li>
                    </ul>

                    <h3>5. Disclaimer</h3>
                    <p>
                        Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance.
                    </p>

                    <h3>6. Service Modifications</h3>
                    <p>
                        We reserve the right to modify, suspend, or discontinue the Service, partially or fully, at any time without prior notice. We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Service.
                    </p>

                    <h3>7. Governing Law</h3>
                    <p>
                        These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
                    </p>

                    <h3>8. Changes to Terms</h3>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                    </p>

                    <h3>9. Contact Us</h3>
                    <p>
                        If you have any questions about these Terms, please contact us at <a href="/contact-us">/contact-us</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
