// Zoom meetings for calendar bookings, via a Server-to-Server OAuth app
// (Zoom Marketplace > Develop > Build App > Server-to-Server OAuth).
// Scopes: meeting:write:meeting:admin and meeting:delete:meeting:admin
// (older apps: meeting:write:admin).
//
// When ZOOM_ACCOUNT_ID / ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET are all set,
// every booking gets a Zoom meeting; otherwise bookings use Google Meet.

const OAUTH_URL = 'https://zoom.us/oauth/token';
const API_BASE = 'https://api.zoom.us/v2';
const TIMEOUT_MS = 8000;

export function zoomConfigured(): boolean {
  return Boolean(
    process.env.ZOOM_ACCOUNT_ID &&
      process.env.ZOOM_CLIENT_ID &&
      process.env.ZOOM_CLIENT_SECRET,
  );
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getZoomToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const basic = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
  ).toString('base64');
  const url = new URL(OAUTH_URL);
  url.searchParams.set('grant_type', 'account_credentials');
  url.searchParams.set('account_id', process.env.ZOOM_ACCOUNT_ID ?? '');
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}` },
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Zoom token failed: ${res.status} · ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export type ZoomMeeting = {
  id: number;
  joinUrl: string;
  password?: string;
};

export async function createZoomMeeting(input: {
  topic: string;
  startIso: string;
  durationMinutes: number;
  timezone: string;
  agenda?: string;
}): Promise<ZoomMeeting> {
  const token = await getZoomToken();
  // "me" is the app owner; ZOOM_HOST_EMAIL hosts on another licensed user.
  const host = encodeURIComponent(process.env.ZOOM_HOST_EMAIL || 'me');
  const res = await fetch(`${API_BASE}/users/${host}/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: input.topic.slice(0, 200),
      type: 2, // scheduled
      start_time: input.startIso,
      duration: input.durationMinutes,
      timezone: input.timezone,
      agenda: input.agenda?.slice(0, 2000),
      settings: {
        join_before_host: false,
        waiting_room: true,
        host_video: true,
        participant_video: true,
        mute_upon_entry: false,
        auto_recording: 'none',
      },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`Zoom create meeting failed: ${res.status} · ${await res.text()}`);
  }
  const data = (await res.json()) as { id: number; join_url: string; password?: string };
  return { id: data.id, joinUrl: data.join_url, password: data.password };
}

// Used to clean up when the calendar invite could not be created, so no
// orphan meeting is left on the host's Zoom account.
export async function deleteZoomMeeting(id: number): Promise<void> {
  try {
    const token = await getZoomToken();
    await fetch(`${API_BASE}/meetings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    console.error(`[zoom] cleanup of meeting ${id} failed`, err);
  }
}
