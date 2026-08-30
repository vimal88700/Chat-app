# Orbit Chat

Orbit Chat is a lightweight room-code chat application for browsers and mobile web. The upgrade keeps the original simple join flow while adding 6–8 digit rooms, safe text rendering, group presence, typing indicators, message edit/delete, media sharing, profile avatars, theme customization, retention controls, offline-friendly shell caching, and optional WebRTC audio/video calls.

## Local setup

```bash
npm install
cp .env.example .env
npm start
```

Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_MEDIA_BUCKET` in the environment. The client never receives a service-role key. If the database variables are missing or rejected, the server stays online and uses an in-memory fallback so the UI can be tested, but data will not persist across restart.

## Supabase setup

Run `supabase_schema.sql` in the Supabase SQL Editor. It creates the `rooms`, `profiles`, and `messages` tables, the retention cleanup function, indexes, Realtime publication membership, and the public `chat-media` bucket with file-type and size restrictions. The included policies are intentionally permissive because the app uses a room code rather than Supabase Auth. They should be tightened if the app becomes private or stores sensitive conversations.

## Render setup

Deploy this repository as a Render Web Service with build command `npm install` and start command `npm start`. Add the environment variables from `.env.example` in the Render dashboard. A free Render service can sleep after 15 minutes without inbound traffic, and its local filesystem is ephemeral, so durable messages and media must remain in Supabase. The app therefore does not write uploads to disk and performs retention cleanup on room joins, message sends, and a best-effort periodic pass.

## Free-tier media policy

The browser compresses images before upload when possible. The server accepts only common image, video, and audio MIME types and caps uploads at 12 MB. For a public free-tier deployment, a lower practical limit such as 6 MB is recommended for ordinary users; Supabase documentation recommends standard uploads for files no larger than 6 MB and resumable uploads for larger files. Storage bandwidth and size should be monitored from the Supabase dashboard.

## Call behavior

Calls remain peer-to-peer and work only in a secure HTTPS context with user permissions. The server now routes accept/decline signaling to the intended peer, exposes call states, uses a timeout, handles missing camera/microphone support, and cleans up tracks and PeerJS objects. Mesh calling is appropriate for small rooms; it is not a scalable conferencing backend. Large group video calls would require an SFU service and are not a realistic free-tier feature.

## Security notes

The legacy anon key supplied for the original prototype was hard-coded in `server.js`. The upgraded code removes it from source and reads `SUPABASE_ANON_KEY` from the environment. An anon/publishable key is designed for client-side exposure, but it must be protected by correct Row Level Security policies. Never place a Supabase service-role key in the browser or repository. Because the supplied key returned an authorization error during the audit, replace it with the current project anon/publishable key before deployment.

## What cannot be applied from a public URL alone

This commit-ready package can be tested locally and pushed to GitHub by the repository owner. Updating the user's actual GitHub branch, Supabase project, or Render service requires authenticated access to those accounts or a connected deployment workflow. After the migration and environment variables are applied, the existing Render service can redeploy from the updated repository.
