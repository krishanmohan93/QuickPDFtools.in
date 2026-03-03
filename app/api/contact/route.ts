import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveContactMessage } from '@/lib/db';
import { sendContactNotification, sendConfirmationEmail } from '@/lib/email';

// Validation schema
const contactSchema = z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
    email: z.string().trim().min(3, 'Email is required').max(320, 'Email is too long'),
    subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject is too long'),
    message: z.string().trim().min(1, 'Message is required').max(5000, 'Message is too long'),
});

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
    try {
        const now = Date.now();
        const limit = rateLimitMap.get(ip);
        if (!limit || now > limit.resetTime) {
            rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
            return true;
        }
        if (limit.count >= 3) return false;
        limit.count++;
        return true;
    } catch (e) {
        return true;
    }
}

function getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIp) return realIp.trim();
    return 'unknown';
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);

        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const parsed = contactSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: parsed.error.issues.map((issue) => ({
                        field: String(issue.path[0] ?? 'form'),
                        message: issue.message,
                    })),
                },
                { status: 400 }
            );
        }

        const validatedData = parsed.data;

        let savedMessageId: number | null = null;

        try {
            const savedMessage = await saveContactMessage({
                ...validatedData,
                ip_address: ip,
            });
            savedMessageId = savedMessage.id;
        } catch (dbError) {
            console.error('Contact DB save failed, continuing with email fallback:', dbError);
        }

        const [adminEmailSent, confirmationEmailSent] = await Promise.all([
            sendContactNotification({ ...validatedData, ip_address: ip }),
            sendConfirmationEmail({
                name: validatedData.name,
                email: validatedData.email,
                subject: validatedData.subject,
            }),
        ]);

        if (!savedMessageId && !adminEmailSent && !confirmationEmailSent) {
            return NextResponse.json(
                { error: 'Failed to submit. Please try again in a moment.' },
                { status: 503 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully!',
            id: savedMessageId,
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
}

