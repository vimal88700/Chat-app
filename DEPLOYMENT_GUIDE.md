# Orbit Chat: Complete Deployment Guide

This guide explains exactly how to apply the delivered Orbit Chat upgrade to your existing GitHub repository, connect it to Supabase, and redeploy it on Render. Follow the order shown. Do not skip the Supabase migration or the Render environment variables.

> **Important security note:** The legacy Supabase anon key was posted in the conversation and returned an authorization error during testing. Do not paste that old value into the new deployment. Copy the current anon/publishable key from the Supabase dashboard. Never use or commit a `service_role` key.

## 1. What you received

Download the attachment named `orbit-chat-upgrade.zip` from the previous message and extract it on your computer. The extracted folder is the new application folder. The files should be placed at the root of your GitHub repository, not inside a second nested folder.

The final repository should look like this:

| Location | Purpose | Action |
|---|---|---|
| `package.json` | Node dependencies and start/check commands | Replace the old file |
| `package-lock.json` | Locked dependency versions | Add or replace it |
| `server.js` | Express, Socket.IO, uploads, persistence, retention, profiles, and call signaling | Replace the old file |
| `public/index.html` | Complete responsive chat interface | Replace the old file |
| `public/sw.js` | Small offline-friendly application-shell cache | Add this file |
| `supabase_schema.sql` | Database, policies, retention function, Realtime, and Storage setup | Add this file; run it in Supabase |
| `.env.example` | Names of required environment variables | Add this file; do not put real secrets here |
| `.gitignore` | Prevents `.env` and `node_modules` from being committed | Add this file |
| `README.md` | Project documentation | Replace the old file |
| `test_server.js` | Optional local backend integration test | Add this file |
| `DELIVERY_NOTES.md`, `audit_findings.md`, `architecture_options.md` | Supporting documentation | Optional; safe to keep |

Do **not** upload `node_modules/`, `.env`, private keys, passwords, or the old legacy key to GitHub.

## 2. Put the new files into your GitHub repository

### Recommended method: use Git on your computer

First install Git if it is not already installed. Then open Terminal, PowerShell, or Git Bash and run the following commands:

```bash
git clone https://github.com/vimal88700/Chat-app.git
cd Chat-app
```

Make a backup branch before replacing anything:

```bash
git checkout -b backup-before-orbit-upgrade
git push -u origin backup-before-orbit-upgrade
```

Now extract `orbit-chat-upgrade.zip` somewhere outside the repository. Copy the extracted files into the `Chat-app` folder and allow replacement of existing files. On macOS or Linux, if the extracted folder is named `chat-app-audit`, the command is:

```bash
cp -R /path/to/chat-app-audit/. /path/to/Chat-app/
```

On Windows, use File Explorer: open the extracted folder, select all files, copy them, open the cloned `Chat-app` folder, paste, and choose **Replace the files in the destination** when Windows asks.

Before committing, check that the important files exist:

```bash
ls package.json server.js public/index.html public/sw.js supabase_schema.sql .env.example
```

Install dependencies and run the local checks:

```bash
npm install
npm run check
```

Commit and push the upgrade to the main branch:

```bash
git checkout main
git add package.json package-lock.json server.js public/index.html public/sw.js supabase_schema.sql .env.example .gitignore README.md test_server.js
git commit -m "Upgrade Orbit Chat with groups media themes retention and calls"
git push origin main
```

If your default branch is named `master` rather than `main`, use `master` in the two commands that mention `main`.

### GitHub website method

If you cannot use Git locally, open the repository on GitHub and use **Add file → Upload files**. Upload the new files from the extracted archive. For existing files such as `server.js`, `package.json`, `README.md`, and `public/index.html`, GitHub will create a change that replaces the old file when the uploaded path matches the existing path. Make sure `public/sw.js` is uploaded inside the `public` folder.

For a large replacement, the Git method is safer because it preserves the directory structure and gives you a backup branch. GitHub’s web interface is suitable for small file additions and edits; GitHub’s repository documentation describes the normal file-upload and commit workflow [1].

## 3. Create the Supabase database structure

Open the Supabase project that corresponds to your project reference. In your case, the project reference appears to be `tmesumqbayplvypqdcqd`.

Open **SQL Editor**, create a new query, and open the file `supabase_schema.sql` from the extracted package. Copy the entire file into the SQL Editor. Run the complete script once.

The script creates or updates:

| Supabase object | Why the app needs it |
|---|---|
| `rooms` | Validates and stores 6–8 digit room codes and retention defaults |
| `profiles` | Stores compact profile names and avatar URLs |
| `messages` | Stores text, edits, deletes, media metadata, and expiration times |
| `delete_expired_messages()` | Removes messages whose expiration time has passed |
| `ensure_room()` | Creates a room record automatically when somebody joins a new code |
| Indexes | Keeps room history and expiration cleanup faster |
| `supabase_realtime` membership | Allows database-backed message changes to be available to Realtime if needed |
| `chat-media` Storage bucket | Stores uploaded images, videos, and audio |
| Storage policies | Allows the room-code prototype to read and upload media |

After the query completes, open **Table Editor** and confirm that `rooms`, `profiles`, and `messages` exist. If the SQL Editor reports that the Realtime publication already contains the table, that is normally harmless; the migration includes a duplicate-object handler for that situation.

### Important policy limitation

This version uses room codes and anonymous browser-generated client IDs. Its policies are intentionally permissive so the free-tier prototype can work without Supabase Auth. Anyone who knows a room code may be able to read or submit data allowed by those policies. Do not use this policy model for confidential conversations, health information, financial information, or private business data. Add Supabase Auth and tighten Row Level Security before using the app for sensitive content. Supabase’s Row Level Security guidance explains why policies should be based on authenticated users for private data [2].

### Confirm Storage

Open **Storage → Buckets**. Confirm that a bucket named `chat-media` exists and is public. The SQL migration creates it automatically when possible. If it does not exist, create it manually with these values:

| Setting | Value |
|---|---|
| Bucket name | `chat-media` |
| Public bucket | Enabled for this room-code prototype |
| Maximum file size | `12 MB` or `12582912` bytes |
| Allowed image types | JPEG, PNG, WebP, GIF |
| Allowed video types | MP4, WebM, OGG |
| Allowed audio types | MPEG, MP4, OGG, WebM, WAV, AAC, M4A |

For reliable free-tier behavior, ask users to keep ordinary files below approximately **6 MB**. Supabase documents standard uploads for smaller files and recommends resumable uploads for larger files [3]. The application rejects unsupported types and rejects files above its 12 MB server cap.

## 4. Get the correct Supabase API values

In Supabase, open **Project Settings → API**. Copy these two values:

| Supabase value | Where it goes |
|---|---|
| Project URL, such as `https://tmesumqbayplvypqdcqd.supabase.co` | Render variable `SUPABASE_URL` |
| Current anon or publishable key | Render variable `SUPABASE_ANON_KEY` |

Use the project root URL. If you copy a REST URL ending in `/rest/v1/`, the server also normalizes it, but the root URL is clearer and preferred.

Do not put the key into `public/index.html`. Do not put it directly into `server.js`. Do not add a `.env` file to GitHub. The application reads these values only from the Render environment.

## 5. Configure Render

Open the Render dashboard and select the existing service that currently serves:

`https://chat-app-0che.onrender.com`

Open **Settings** and verify that the service is connected to the GitHub repository `vimal88700/Chat-app` and the branch you pushed, usually `main`.

Set the service configuration as follows:

| Render setting | Value |
|---|---|
| Service type | Web Service |
| Build command | `npm install` |
| Start command | `npm start` |
| Root directory | Leave blank unless the repository contains the app inside a subfolder |
| Environment | Node |
| Region | Keep your existing region unless you have a reason to change it |

Then open **Environment → Add Environment Variable** and add exactly these variables:

```text
SUPABASE_URL=https://tmesumqbayplvypqdcqd.supabase.co
SUPABASE_ANON_KEY=PASTE_THE_CURRENT_ANON_OR_PUBLISHABLE_KEY_HERE
SUPABASE_MEDIA_BUCKET=chat-media
CLIENT_ORIGIN=https://chat-app-0che.onrender.com
PORT=3000
```

Do not include quotation marks around the values. Do not add `/rest/v1/` to `SUPABASE_URL` unless that is the only value provided by your dashboard. Do not add a `service_role` key.

Save the environment variables and choose **Manual Deploy → Deploy latest commit**, or push a new commit to the connected branch and let Render deploy automatically. Wait for the deploy log to show that `npm install` and `npm start` completed successfully.

Render free Web Services may sleep after a period without traffic, and local service files are not durable. This application therefore stores messages and media in Supabase rather than relying on the Render filesystem. Render documents the behavior and limitations of free services here [4].

## 6. Test the deployed application

Perform the following checks in order.

### Health check

Open this URL in a browser:

```text
https://chat-app-0che.onrender.com/health
```

You should receive JSON containing `"ok":true`. After Supabase is configured successfully, `databaseConfigured` should be `true`.

If `databaseConfigured` is `false`, check the Render environment variable names character-for-character and confirm that the key is the current anon/publishable key from Supabase.

### Room and group test

Open the app in two separate browser windows or on two devices. Use the same 6–8 digit code, for example `12345678`, but use different names such as `Alice` and `Bob`.

Confirm that each browser sees the other person under **People here**, that the connection status says **Connected**, and that a message sent from one browser appears in the other browser.

### Message test

Send a normal text message. Verify that the sender sees **Edit** and **Delete** controls. Edit the message and confirm the other browser sees the edited content. Delete it and confirm it becomes a deleted-message placeholder rather than exposing the old text.

### Media test

Use the plus button beside the composer. Test one small JPEG or PNG first. Then test one short MP4/WebM video and one short audio file. Confirm that each appears as a media message and that the other browser can load it.

If uploads fail, check the browser Network panel and the Render logs. A `400 Unsupported file type` response means the selected type is outside the allowed list. A `413` or size-related error means the file is above the upload cap. A `500` or Storage error usually means the bucket, key, or Storage policies are not configured correctly.

### Call test

Use HTTPS, not a local `http://` URL, for real microphone and camera testing. Browser media capture requires a secure context and user permission [5]. Test with two different browsers or devices, accept microphone and camera permission prompts, and try audio before video.

The implementation uses peer-to-peer WebRTC signaling and public STUN servers. It is intended for small calls, not large group video conferencing. Some restrictive corporate, school, VPN, mobile, or carrier networks may require a TURN relay; adding a TURN service would introduce another service and possibly another cost.

### Retention test

Open **Message retention** and choose a period. New messages will receive an expiration time. Cleanup occurs when users join rooms, send messages, and during the server’s best-effort periodic cleanup. A sleeping free Render service cannot guarantee exact background deletion at the precise expiration second, so do not describe this as a compliance-grade deletion system.

### Theme and profile test

Open **Change appearance**, select Light, Violet, or Sunset, choose an accent color, and press **Apply**. Open **Edit profile**, change the name, and upload a small avatar. The browser compresses avatars before upload when possible.

## 7. Troubleshooting table

| Symptom | Likely cause | Fix |
|---|---|---|
| Render deploy fails at `npm install` | Wrong repository root or incomplete file replacement | Confirm `package.json` is at repository root and rerun the deploy |
| Render says start command failed | Wrong start command or missing package script | Use `npm start`; confirm `package.json` contains the start script |
| `/health` works but `databaseConfigured` is false | Missing or rejected Supabase variables | Re-enter `SUPABASE_URL` and the current anon/publishable key in Render |
| Messages disappear after restart | Supabase migration or credentials are not active | Run `supabase_schema.sql`, then verify `/health` reports `databaseConfigured:true` |
| Upload returns Storage error | Missing bucket or Storage policy | Confirm `chat-media` exists, is public for this prototype, and rerun the Storage section of the SQL migration |
| Upload returns unsupported type | Browser file MIME type is not on the allowlist | Use JPEG, PNG, WebP, GIF, MP4, WebM, OGG, MP3, WAV, AAC, or M4A |
| Call says nobody accepted | The second browser did not accept, peer signaling is still starting, or the network blocks peer discovery | Wait briefly, retry audio first, check permissions, disable restrictive VPNs, and test another network |
| App shows an old design after deploy | Browser or service-worker cache | Open the URL with a query such as `?v=2`, hard-refresh, and wait for the new service worker to install |
| Other people cannot see profile avatars | Old browser session joined before the latest profile payload was deployed | Leave and rejoin the room, then upload/save the avatar again |
| App is slow on mobile | Large media files or heavy network conditions | Use compressed images and short media; keep normal uploads below 6 MB |
| Render becomes unavailable temporarily | Free service sleeping or restarting | Open the service again and wait for the service to wake; durable data remains in Supabase |

## 8. Local testing commands

To run the application on your own computer:

```bash
npm install
cp .env.example .env
npm start
```

Open `http://localhost:3000`. Without valid Supabase variables, the application runs in demo mode and stores messages only in memory. That is useful for testing the interface, but messages will be lost when the server restarts.

To check the server syntax:

```bash
npm run check
```

To run the included realtime backend smoke test:

```bash
node test_server.js
```

The test starts a temporary local server, connects two clients, and checks room presence, typing, message delivery, edit, delete, and call signaling. It does not test real camera permissions or actual media upload to your Supabase project.

## 9. What is included and what is intentionally not promised

Included are room-code group chat, live presence, typing indicators, safe text rendering, message edit/delete, image/video/audio upload paths, compact avatars, customizable themes, retention settings, a lightweight looping jet-flight landing animation, responsive layout, offline-friendly shell caching, and improved small-room call signaling.

The app is not a full Telegram or Instagram replacement. It does not include end-to-end encryption, account recovery, private authenticated rooms, moderation, message search, push notifications, a scalable group-video SFU, or guaranteed background deletion while a free Render service is asleep. Those features require additional architecture and, in some cases, additional services.

## References

[1]: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository "GitHub Docs — Adding a file to a repository"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase Docs — Row Level Security"
[3]: https://supabase.com/docs/guides/storage/uploads/standard-uploads "Supabase Docs — Standard Uploads"
[4]: https://render.com/docs/free "Render Docs — Deploy for Free"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "MDN — MediaDevices.getUserMedia()"
