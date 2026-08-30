# Orbit Chat upgrade delivery notes

The local repository is upgraded from the original prototype to a lightweight Orbit Chat build. Confirmed locally: 6–8 digit room entry, group presence, connected/reconnecting status, safe text rendering, text messaging, message edit/delete controls, typing indicator wiring, light/dark/violet/sunset themes, custom accent color, retention settings, compact profile avatar flow, responsive layout, CSS-only looping jet-flight landing scene, static shell caching, media upload validation, and peer call signaling with cleanup and public STUN configuration.

The real server integration smoke test passed for room join, two-member presence, typing, text delivery, edit, delete, and targeted call accept signaling. Browser smoke testing passed for entering an 8-digit room, rendering the room workspace, sending a message, and switching to the light theme. Media upload to Supabase and real calls cannot be fully verified from the sandbox because the supplied Supabase credential returned HTTP 401 and real device permissions/second-party call participants are unavailable.

## Deploy order

1. Run `supabase_schema.sql` in the Supabase SQL Editor.
2. Create the Render environment variables from `.env.example`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_MEDIA_BUCKET=chat-media`, and `CLIENT_ORIGIN` set to the Render URL.
3. Use Render build command `npm install` and start command `npm start`.
4. Replace the legacy key with the current project anon/publishable key. Do not use a service-role key in this application.
5. Test `/health`, join a room from two browsers, send a small image, and make an audio call. Keep ordinary media under 6 MB where possible; the server cap is 12 MB.

The code is delivered as a commit-ready archive because the public GitHub URL does not provide authenticated write access, and no authenticated Render/Supabase dashboard session was available. Import the archive into the repository and redeploy after applying the SQL and environment variables.

## Free-tier limitation to retain in product copy

Render free services can sleep after 15 minutes without inbound traffic and have ephemeral local files [1]. Supabase Free provides finite database, Storage, egress, Realtime message, and peak-connection quotas [2]. Supabase recommends standard uploads for files no larger than 6 MB and resumable uploads above that size [3]. Browser calls require HTTPS and user permission and may fail by device or browser policy [4]. Large group video calls need an SFU and are not implemented as a free-tier mesh call.

## References

[1]: https://render.com/docs/free "Render — Deploy for Free"
[2]: https://supabase.com/docs/guides/platform/billing-on-supabase "Supabase — About billing on Supabase"
[3]: https://supabase.com/docs/guides/storage/uploads/standard-uploads "Supabase — Standard Uploads"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "MDN — MediaDevices.getUserMedia()"
