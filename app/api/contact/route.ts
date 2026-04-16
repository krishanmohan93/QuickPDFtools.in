import { NextRequest, NextResponse } from 'next/server';

const SUBJECT_OPTIONS = [
    'General Query',
    'Bug Report',
    'Partnership',
    'Other',
] as const;

function validateContactPayload(payload: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}) {
    const issues: Array<{ field: string; message: string }> = [];

    if (!payload.name?.trim()) {
        issues.push({ field: 'name', message: 'Name is required' });
    }

    if (!payload.email?.trim()) {
        issues.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
        issues.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    if (!payload.subject || !SUBJECT_OPTIONS.includes(payload.subject as (typeof SUBJECT_OPTIONS)[number])) {
        issues.push({ field: 'subject', message: 'Please select a valid subject' });
    }

    if (!payload.message?.trim()) {
        issues.push({ field: 'message', message: 'Message is required' });
    } else if (payload.message.trim().length < 10) {
        issues.push({ field: 'message', message: 'Message should be at least 10 characters' });
    }

    return issues;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const issues = validateContactPayload(body || {});
        if (issues.length > 0) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: issues,
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Your message has been received successfully.',
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid request payload' },
            { status: 400 }
        );
    }
}

