# Architecture options for the Chat-app upgrade

## Constraints verified

| Constraint | Impact on the implementation |
| --- | --- |
| Render free web services can spin down after 15 minutes without inbound traffic, and local filesystem changes are lost on restart or spin-down [1] | Do not store uploads or durable state on the Render filesystem. Cold-start and long-lived Socket.IO assumptions must be treated as failure cases. |
| Supabase Free includes 500 MB database size, 1 GB Storage size, 2 million Realtime messages, 200 peak Realtime connections, and 5 GB egress [2] | Store message metadata in Postgres and media in Storage, enforce file-size/type limits, lazy-load media, and avoid unnecessary presence chatter. |
| Supabase standard uploads are recommended for files no larger than 6 MB; resumable uploads are recommended above that size [3] | The default free-tier UX should compress images, limit ordinary attachments to 6 MB, and allow larger video/audio only through an optional resumable path. |
| Browser camera/microphone access requires HTTPS and user permission, and can fail with several browser/device-specific errors [4] | Calling must include capability checks, clear permission errors, retries, device fallback, call timeouts, cleanup, and no hard dependency on camera availability. |

## Viable approaches

| Approach | Tradeoffs | Cost | Setup Complexity |
| --- | --- | --- | --- |
| **A. Supabase-native chat core**: use Supabase Auth/anonymous identity, Postgres tables, Realtime channels, Storage, and a small Render-served frontend; use a dedicated WebRTC signaling channel with explicit call states | Best durability and multi-device behavior; fewer custom socket handlers; requires SQL migrations, RLS/storage policies, and updating the client to use Supabase directly | Can stay within existing free plans if quotas and file limits are respected; Render remains free but cold-start still affects static/backend requests [1] [2] | Medium to high |
| **B. Harden current Socket.IO design**: retain Render as the Socket.IO signaling/message relay, add validated REST endpoints, Supabase Storage, schema migrations, group room records, and robust PeerJS cleanup | Smaller rewrite and preserves the current mental model; reliability is still tied to a sleeping/restarting Render service and PeerJS connectivity; harder to guarantee presence and multi-device consistency | Free to start; may be okay for a small hobby room, but Render free sleep/restarts remain a material limitation [1] | Medium |
| **C. Lightweight static-first fallback**: keep text chat and settings client-led with Supabase Realtime/Storage, and make calling an optional best-effort feature with a clear unsupported state | Lowest runtime cost and fastest load; less reliable for calls and advanced moderation; less suitable for large groups | Lowest ongoing resource use on the existing free tiers [2] | Low to medium |

## Recommended default

For the requested Instagram/Telegram-style feature set, Approach A is the strongest technical fit: Postgres/Realtime/Storage should own durable chat state, while WebRTC should be explicitly treated as peer-to-peer and best-effort. To keep the first release manageable, implement the core in stages: text + groups + typing/presence + editing + retention + profiles/themes, then media, then calling enhancements.

The repository can be prepared locally and delivered as a commit-ready archive. Applying the database migration, Storage bucket policy, environment variables, and deployment changes to the user's Supabase/Render accounts requires dashboard or repository access that is not present in the public GitHub link.

## Sources

[1]: https://render.com/docs/free "Render — Deploy for Free"
[2]: https://supabase.com/docs/guides/platform/billing-on-supabase "Supabase — About billing on Supabase"
[3]: https://supabase.com/docs/guides/storage/uploads/standard-uploads "Supabase — Standard Uploads"
[4]: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "MDN — MediaDevices.getUserMedia()"
