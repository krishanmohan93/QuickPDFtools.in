import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
    title: `${SITE_NAME} Blog – PDF Guides, Tutorials & Document Tips`,
    description: 'Expert guides, tutorials, and tips on PDF management, document security, file conversion, and productivity tools. Learn how to work smarter with digital documents.',
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
