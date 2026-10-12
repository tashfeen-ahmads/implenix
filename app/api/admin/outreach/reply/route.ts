import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { requireTeamApi } from '@/lib/supabase/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { Contact } from '@/lib/db/types';
import { SesSendError } from '@/lib/outreach/ses';
import { ThreadError, sendThreadReply } from '@/lib/outreach/thread';

// Manual reply from the inbox, threaded onto the conversation and sent
// from the campaign the contact was last emailed from.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  contactId: z.string().uuid(),
  subject: z.string().max(300).optional().nullable(),
  body: z.string().trim().min(1).max(20_000),
});

export async function POST(req: NextRequest) {
  const auth = await requireTeamApi();
  if (auth.error) return auth.error;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Body must be {contactId, subject, body}' }, { status: 400 });
  const db = supabaseAdmin();

  const { data } = await db.from('contacts').select('*').eq('id', parsed.data.contactId).maybeSingle();
  const contact = data as Contact | null;
  if (!contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 });

  try {
    await sendThreadReply(db, {
      contact,
      subject: parsed.data.subject,
      body: parsed.data.body,
      aiGenerated: false,
      sentBy: auth.member.user_id,
    });
  } catch (err) {
    if (err instanceof ThreadError) return NextResponse.json({ error: err.message }, { status: err.status });
    const message = err instanceof SesSendError ? `${err.code}: ${err.message}` : 'Send failed';
    return NextResponse.json({ error: message.slice(0, 300) }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
