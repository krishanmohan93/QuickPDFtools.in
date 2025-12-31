
import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
    title: "Privacy Policy | " + SITE_NAME,
    description: "Detailed Privacy Policy for " + SITE_NAME + ". Learn about how we collect, use, and protect your data, including adherence to GDPR, CCPA, and Google AdSense policies.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white min-h-screen py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                <p className="text-gray-600 mb-8"><strong>Effective Date:</strong> January 1, 2024</p>

                <div className="prose prose-lg prose-blue text-gray-700 max-w-none">
                    <p>
                        Welcome to {SITE_NAME} ("we," "our," or "us"). We respect your privacy and are committed to protecting personally identifiable information you may provide us through the Website. We have adopted this privacy policy ("Privacy Policy") to explain what information may be collected on our Website, how we use this information, and under what circumstances we may disclose the information to third parties.
                    </p>

                    <h3>1. Information We Collect</h3>

                    <h4>1.1 Personal Information</h4>
                    <p>
                        We do not require user registration to use our PDF tools. Therefore, we do not collect personal identifiers such as your name, address, or phone number unless you voluntarily provide them through our contact forms.
                    </p>

                    <h4>1.2 Usage Data & Analytics</h4>
                    <p>
                        We automatically collect certain information when you visit, use, or navigate the Website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Website, and other technical information. This information is primarily needed to maintain the security and operation of our Website, and for our internal analytics and reporting purposes.
                    </p>

                    <h4>1.3 User Files (PDFs and Documents)</h4>
                    <p>
                        When you use our PDF conversion, merging, or editing tools, you upload files to our servers. <strong>We hold user privacy paramount regarding these files:</strong>
                    </p>
                    <ul>
                        <li><strong>Processing:</strong> Files are uploaded solely for the purpose of the requested processing.</li>
                        <li><strong>Storage:</strong> Processed files are stored temporarily on our servers to allow you to download them.</li>
                        <li><strong>Deletion:</strong> All user-uploaded and processed files are automatically and permanently deleted from our servers after **1 hour**.</li>
                        <li><strong>Access:</strong> We do not look at, read, or analyze the content of your files. File transfer is encrypted using SSL/TLS technology.</li>
                    </ul>

                    <h3>2. Use of Cookies and Tracking Technologies</h3>
                    <p>
                        We use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our <a href="/cookie-policy">Cookie Policy</a>.
                    </p>

                    <h3>3. Google AdSense & Third-Party Advertising</h3>
                    <p>
                        We use Google AdSense to display advertisements. Google uses cookies to serve ads based on your prior visits to our website or other websites on the internet.
                    </p>
                    <ul>
                        <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visits to our sites and/or other sites on the Internet.</li>
                        <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
                    </ul>
                    <p>
                        Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites. We have no control over the content of the advertisements or the data collected by these third-party advertisers.
                    </p>

                    <h3>4. GDPR Data Protection Rights</h3>
                    <p>
                        We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                    </p>
                    <ul>
                        <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                        <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                        <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                        <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
                    </ul>

                    <h3>5. CCPA Privacy Rights (Do Not Sell My Personal Information)</h3>
                    <p>
                        Under the CCPA, among other rights, California consumers have the right to:
                    </p>
                    <ul>
                        <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
                        <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
                        <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
                    </ul>

                    <h3>6. Data Security</h3>
                    <p>
                        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security. Please refer to our <a href="/security-policy">Security Policy</a> for more details.
                    </p>

                    <h3>7. Changes to This Privacy Policy</h3>
                    <p>
                        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                    </p>

                    <h3>8. Contact Us</h3>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us via our <a href="/contact-us">Contact Page</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
