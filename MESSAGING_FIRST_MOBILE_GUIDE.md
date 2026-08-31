# Correct Orbit Chat update — mobile steps

You were right about the original concept: Orbit Chat is a **no-login messaging platform**. This corrected version does not open Jitsi, does not ask anyone to log in, and does not create a separate meeting experience.

The top bar now has one **Call** button. Tapping it opens two choices inside Orbit Chat:

```text
Audio call
Video call
```

The same update also keeps the message bar fixed, keeps message history scrollable, and includes the corrected call-accept handshake.

## Only two files are required

Replace these exact GitHub files:

```text
/server.js
/public/index.html
```

Do not run SQL for this update. Do not add a Jitsi variable. Do not add a login system.

## Step 1 — Download and extract

1. Download the attachment `orbit-chat-messaging-first.zip`.
2. Open your phone’s Files or File Manager app.
3. Open Downloads.
4. Tap the ZIP.
5. Choose Extract or Unzip.
6. In the extracted folder, locate `server.js`.
7. Open the extracted `public` folder and locate `index.html`.

The local file arrangement must be:

```text
extracted-folder/server.js
extracted-folder/public/index.html
```

## Step 2 — Replace the root `server.js` on GitHub

1. Visit `https://github.com/vimal88700/Chat-app` in Chrome.
2. Sign in.
3. If needed, enable **Desktop site** from the browser menu.
4. On the main repository file list, tap `server.js`.
5. Tap the pencil/edit icon.
6. Tap inside the editor and choose **Select all**.
7. Delete the old code.
8. Open the extracted `server.js` in your Files app.
9. Choose **Select all → Copy**.
10. Return to GitHub and paste into the empty editor.
11. Scroll down.
12. Enter the commit message:

```text
Fix call connection
```

13. Tap **Commit changes**.

Correct path:

```text
Chat-app/server.js
```

## Step 3 — Replace `public/index.html` on GitHub

1. Return to the repository file list.
2. Tap the folder named `public`.
3. Confirm the breadcrumb says `Chat-app / public`.
4. Tap the existing `index.html`.
5. Tap the pencil/edit icon.
6. Tap inside the editor and choose **Select all**.
7. Delete the old code.
8. Open the extracted `public` folder.
9. Open its `index.html`.
10. Choose **Select all → Copy**.
11. Return to GitHub and paste into the empty editor.
12. Scroll down.
13. Enter the commit message:

```text
Restore messaging-first calls and mobile scrolling
```

14. Tap **Commit changes**.

Correct path:

```text
Chat-app/public/index.html
```

Do not create `Chat-app/index.html` or `Chat-app/public/public/index.html`.

## Step 4 — Do not touch SQL

For this update, ignore these files:

```text
supabase_schema.sql
.env.example
```

Do not open Supabase SQL Editor. Do not run a migration. Do not change Render variables. This correction only changes the client interface and the call signaling behavior.

## Step 5 — Deploy once on Render

1. Visit `https://dashboard.render.com`.
2. Sign in.
3. Open the service named `Chat-app`.
4. Tap **Manual Deploy**.
5. Tap **Deploy latest commit**.
6. Wait until Render says **Live**.

## Step 6 — Refresh the phone page

After Render says Live, open:

```text
https://chat-app-0che.onrender.com/?v=messagingfirst2
```

If the old Jitsi screen remains, close the browser tab completely and open the cache-busting link again. The new screen must show **Call**, not **Meet**.

## Step 7 — Test the messaging layout

Send enough messages to fill the phone screen. The message bar must remain visible at the bottom. Swipe up inside the history to read older messages. A `↓ Latest` button should appear when you are away from the newest message. Tap it to return to the bottom.

## Step 8 — Test calling

Use two phones or two separate browsers in the same room.

1. On device A, tap **Call**.
2. Choose **Audio call** or **Video call**.
3. On device B, tap **Accept**.
4. Allow microphone or camera permissions on both devices.
5. The call should move from Connecting to Connected.
6. Use **End** to finish.

There is no login step. There is no meeting room step. There is no Jitsi step.

If the basic peer-to-peer call is blocked by a VPN, school network, corporate network, carrier network, or restrictive NAT, the interface will report the failure. The room messaging remains usable.

## Final screen you should see

The top bar should contain:

```text
Call   ●
```

After tapping Call, the menu should contain:

```text
Audio call
Video call
```

It should not contain:

```text
Meet
Room meeting
Open full screen
Jitsi
```
