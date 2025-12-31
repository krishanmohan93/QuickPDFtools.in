import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveContactMessage } from '@/lib/db';
import { sendContactNotification, sendConfirmationEmail } from '@/lib/email';

// Validation schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    email: z.string().email('Invalid email address'),
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject is too long'),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long'),
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
    return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIP(request);

        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const validatedData = contactSchema.parse(body);

        // Save to DB
        const savedMessage = await saveContactMessage({
            ...validatedData,
            ip_address: ip,
        });

        // Send Emails (Fire and forget, do not await)
        // We wrap in a separate async wrapper to ensure it runs
        (async () => {
            try {
                await sendContactNotification({ ...validatedData, ip_address: ip });
                await sendConfirmationEmail({
                    name: validatedData.name,
                    email: validatedData.email,
                    subject: validatedData.subject
                });
                console.log("Emails sent successfully");
            } catch (emailError) {
                console.error("Email sending background task failed:", emailError);
            }
        })();

        return NextResponse.json({
            success: true,
            message: 'Message sent successfully!',
            id: savedMessage.id,
        });

    } catch (error) {
        console.error('API Error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to submit', debug: String(error) }, { status: 500 });
    }
}
