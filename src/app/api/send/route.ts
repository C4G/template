import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import React from 'react';
import { MessageTemplate } from '../../../components/email-templates/message';

const from = 'No Reply <noreply@c4g.dev>';

// Lazy-load Resend client to avoid build-time initialization
let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function POST(req: Request) {
  const session = await auth();
  const {
    email,
    name,
    template,
    body,
    subject: customSubject,
  } = await req.json();

  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (template !== 'message') {
    return Response.json({ error: 'Invalid template' }, { status: 400 });
  }

  const subject = customSubject || 'Message from C4G Admin!';

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from,
      to: [email],
      subject,
      react: React.createElement(MessageTemplate, { name, body }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
