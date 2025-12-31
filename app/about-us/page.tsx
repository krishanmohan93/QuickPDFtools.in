
import { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
    title: "About Us | " + SITE_NAME,
    description: "Learn about the team and mission behind " + SITE_NAME + ".",
};

export default function AboutUsPage() {
    return (
        <div className="bg-white min-h-screen py-12 md:py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">About Us</h1>

                <div className="prose prose-lg prose-blue text-gray-700 max-w-none">
                    <p className="lead text-xl text-gray-500 mb-8">
                        Welcome to {SITE_NAME}, your trusted partner for simple, secure, and efficient PDF management.
                    </p>

                    <h3>Our Mission</h3>
                    <p>
                        In a digital-first world, documents are the currency of communication. Yet, working with the most common document format—PDF—has historically been difficult, requiring expensive software or complex installations.
                    </p>
                    <p>
                        Our mission at {SITE_NAME} is to democratize PDF tools. We believe that everyone, from students to enterprise executives, should have access to professional-grade document manipulation tools without barriers. We strive to provide a platform that is:
                    </p>
                    <ul>
                        <li><strong>Accessible:</strong> Free to use for everyone, everywhere.</li>
                        <li><strong>Private:</strong> Respecting user data with ephemeral processing.</li>
                        <li><strong>Efficient:</strong> Saving you time with fast, intuitive workflows.</li>
                    </ul>

                    <h3>Our Technology</h3>
                    <p>
                        {SITE_NAME} is built on modern web technologies using a cloud-native architecture. This allows us to scale instantly to meet demand, ensuring that your file conversions happen in seconds, not minutes.
                    </p>
                    <p>
                        We utilize state-of-the-art encryption standards to ensure that your data is safe from the moment it leaves your device until it is deleted from our servers. Our processing algorithms are constantly refined to ensure the highest fidelity in conversion quality—preserving your layouts, fonts, and images.
                    </p>

                    <h3>Who We Are</h3>
                    <p>
                        We are a team of passionate developers, designers, and product enthusiasts dedicated to solving productivity headaches. Started in 2024, {SITE_NAME} has grown from a simple file merger utility into a comprehensive suite of over 15 PDF tools.
                    </p>

                    <h3>Why Choose Us?</h3>
                    <p>
                        Unlike many other online tools, we prioritize <strong>User Experience</strong> and <strong>Privacy</strong> above all else. We don't clutter our interface with intrusive ads that break functionalities, and we definitely don't sell your data. We are building the tool we wanted to use ourselves.
                    </p>

                    <h3>Our Core Values</h3>
                    <p>At QuickPDFTools, our culture is defined by a set of core values that guide every decision we make:</p>
                    <ul>
                        <li><strong>User-Centric Design:</strong> We believe that powerful tools don't have to be complicated. Every feature is designed with the user's journey in mind, ensuring clarity and ease of use.</li>
                        <li><strong>Transparency:</strong> We are open about how we handle your data. Our privacy policies are written in plain English, not legalese, because trust is earned through honesty.</li>
                        <li><strong>Continuous Innovation:</strong> The digital landscape is always changing. We consistently update our algorithms and infrastructure to support the latest PDF standards and browser technologies.</li>
                        <li><strong>Accessibility:</strong> We strive to make our tools accessible to users with disabilities, adhering to WCAG guidelines wherever possible.</li>
                    </ul>

                    <h3>Sustainability Commitment</h3>
                    <p>
                        Digital sustainability is about minimizing the carbon footprint of our internet usage. By optimizing our compression algorithms and using efficient serverless architecture, we reduce the computational power required for each file conversion. This not only makes our tools faster but also greener. We are committed to hosting our services on carbon-neutral cloud providers.
                    </p>

                    <h3>Global Reach</h3>
                    <p>
                        Since our launch, we have served users from over 150 countries. Whether you are a student in Mumbai, a designer in New York, or a business owner in London, QuickPDFTools provides the same high-quality experience. We are constantly working on expanding our language support to make our tools truly universal.
                    </p>

                    <h3>Data Privacy & Security</h3>
                    <p>
                        We understand that trust is the foundation of our service. Our security infrastructure includes:
                    </p>
                    <ul>
                        <li><strong>End-to-End Encryption:</strong> All file transfers are protected by SSL/TLS encryption.</li>
                        <li><strong>No Permanent Storage:</strong> We employ automated scripts to wipe your files from our servers after 60 minutes. We do not keep backups of user content.</li>
                        <li><strong>GDPR & CCPA Compliance:</strong> We fully adhere to international data protection regulations, giving you control over your digital footprint.</li>
                    </ul>

                    <h3>Contact Us</h3>
                    <p>
                        We are always looking to improve. If you have feedback, feature requests, or just want to say hello, please reach out to us via our <a href="/contact-us">Contact Page</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
