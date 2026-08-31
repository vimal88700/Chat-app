# One combined mobile update for Orbit Chat

This package contains all three fixes together:

1. **Message bar and scrolling fix:** the message bar stays visible, the message history scrolls, and `↓ Latest` returns you to the newest message.
2. **Audio/video call fix:** the Accept action now sends the accepting device’s PeerJS ID correctly instead of leaving the call stuck on Connecting.
3. **Google Meet-style meetings:** the room has a **Meet** button that opens a Jitsi multi-person meeting with participant tiles, microphone, camera, chat, participant list, tile view, full screen, settings, and screen sharing where supported.

## Files you must replace

Replace exactly these two files:

```text
/server.js
/public/index.html
```

`server.js` goes in the main repository folder. `index.html` goes inside the existing `public` folder.

The Jitsi meeting feature and scrolling feature are inside `public/index.html`. The call fix needs both files together.

## Step 1 — Download and extract the combined ZIP

1. Tap the attachment named `orbit-chat-upgrade-scroll-fix.zip` in this chat.
2. Tap **Download**.
3. Open your phone’s **Files**, **My Files**, or **File Manager** application.
4. Open the **Downloads** folder.
5. Tap `orbit-chat-upgrade-scroll-fix.zip`.
6. Choose **Extract**, **Unzip**, or **Extract here**.
7. Open the extracted folder.

You should see this arrangement:

```text
extracted-folder/
├── server.js
└── public/
    └── index.html
```

Do not upload the ZIP itself to GitHub. Do not upload the `node_modules` folder.

## Step 2 — Replace `server.js` in GitHub

1. Open Chrome or Safari.
2. Visit `https://github.com` and sign in.
3. Open `https://github.com/vimal88700/Chat-app`.
4. If the mobile page is difficult, open the browser menu and turn on **Desktop site**.
5. In the repository file list, tap **server.js**.
6. Tap the pencil icon or **Edit this file**.
7. Tap inside the code editor.
8. Choose **Select all**.
9. Press **Delete**.
10. Open the extracted `server.js` file in your phone’s Files app.
11. Choose **Select all → Copy**.
12. Return to the GitHub editor.
13. Tap inside the empty editor and choose **Paste**.
14. Scroll to the bottom of GitHub.
15. Type this commit message:

```text
Update call signaling backend
```

16. Select **Commit directly to the main branch** if GitHub asks.
17. Tap **Commit changes**.

The correct location is:

```text
https://github.com/vimal88700/Chat-app/blob/main/server.js
```

Do not put `server.js` inside `public`.

## Step 3 — Replace `public/index.html` in GitHub

1. Return to the repository file list by tapping the repository name or the top breadcrumb.
2. Tap the folder named **public**.
3. Confirm that the breadcrumb shows:

```text
Chat-app / public
```

4. Tap the existing **index.html** file.
5. Tap the pencil icon or **Edit this file**.
6. Tap inside the editor.
7. Choose **Select all**.
8. Press **Delete**.
9. Open the extracted folder in your phone’s Files app.
10. Open its **public** folder.
11. Open the extracted **index.html**.
12. Choose **Select all → Copy**.
13. Return to the GitHub editor.
14. Tap inside the empty editor and choose **Paste**.
15. Scroll to the bottom.
16. Type this commit message:

```text
Fix mobile chat and add meetings
```

17. Select **Commit directly to the main branch** if GitHub asks.
18. Tap **Commit changes**.

The correct final location is:

```text
https://github.com/vimal88700/Chat-app/blob/main/public/index.html
```

Do not create any of these wrong paths:

```text
/index.html
/public/public/index.html
/public/index.html/index.html
```

## Step 4 — Check the two files on GitHub

Before opening Render, check these paths:

| File | Correct GitHub location |
|---|---|
| Backend call fix | `/server.js` |
| Scrolling, fixed composer, Meet button, call client fix | `/public/index.html` |

Open both files and confirm that the newest commit message appears. If you accidentally created `public/public`, delete the wrong file and repeat Step 3 from the existing `public/index.html`.

## Step 5 — Deploy both changes on Render

1. Visit `https://dashboard.render.com`.
2. Sign in.
3. Open the service called **Chat-app**.
4. Confirm it is connected to `vimal88700 / Chat-app`.
5. Confirm the branch is `main`.
6. Tap **Manual Deploy** near the top.
7. Tap **Deploy latest commit**.
8. Wait for the log to finish.
9. Wait until the service status says **Live**.

Do not change the Build command or Start command for this update if they already work:

```text
Build command: npm install
Start command: npm start
```

This combined update does not require a new Supabase SQL migration or a new environment variable. Keep your existing correct Supabase variables in Render.

## Step 6 — Open the fresh version on your phone

After Render says **Live**, open:

```text
https://chat-app-0che.onrender.com/?v=combinedfix1
```

The extra query text forces your phone to request the newest HTML. If the old page still appears, close the tab completely and reopen the address. If necessary, clear site data for `chat-app-0che.onrender.com` in your browser settings.

## Step 7 — Test the message bar and scrolling

1. Enter a room with a 6–8 digit code.
2. Enter your display name.
3. Send many messages until the screen fills.
4. Confirm that the message bar remains visible at the bottom.
5. Swipe up inside the message history.
6. Confirm that older messages can be read.
7. Confirm that the `↓ Latest` button appears when you are away from the bottom.
8. Tap `↓ Latest`.
9. Confirm that the view returns to the newest message.

If the message bar disappears, you are probably still seeing the old cached page or Render deployed the wrong GitHub branch.

## Step 8 — Test the audio/video call fix

Use two separate phones or two different browsers. Both users must enter the same room code.

1. Test audio first.
2. On both devices, allow microphone permission.
3. On device A, start the call.
4. On device B, tap **Accept**.
5. The caller should move from **Calling** or **Connecting** to **Connected**.
6. End the call.
7. Test video.
8. Allow camera permission on both devices.

If the call still fails, try without a VPN, school network, corporate network, or restrictive carrier network. The basic PeerJS call is peer-to-peer and can be blocked by some networks. Use the **Meet** button for the more complete meeting experience.

## Step 9 — Test the Google Meet-style meeting

1. Enter the same room on two devices.
2. Tap the **Meet** button at the top right.
3. Wait for the Jitsi meeting screen.
4. Allow microphone and camera permissions.
5. Confirm the other participant joins the same meeting.
6. Try the microphone, camera, chat, participants, tile view, settings, full screen, and Leave controls.
7. Use **Open full screen** if the embedded meeting is cramped on a phone.

The meeting room name is derived from the Orbit room code. Anyone who knows the room code may try to enter the corresponding public Jitsi meeting, so do not use ordinary room codes for highly sensitive conversations.

## Common mobile mistakes

| Problem | Fix |
|---|---|
| ZIP uploaded directly to GitHub | Extract it first and upload the files inside it |
| `server.js` placed in `public` | Move it to the repository root |
| `public/public/index.html` created | Open the existing `public` folder and replace its `index.html` |
| Only one file updated | Replace both `/server.js` and `/public/index.html` |
| Changes committed to another branch | Commit to the branch Render uses, normally `main` |
| Render still shows old behavior | Manual Deploy the latest commit and open `?v=combinedfix1` |
| Call permission denied | Allow microphone/camera permissions in both browsers |
| Meet does not load | Check internet and use **Open full screen** |
| Secret key accidentally uploaded | Remove it from GitHub and rotate it in Supabase immediately |

The complete combined package is designed so you perform **one update**, **one Render redeploy**, and **one test round** for all three improvements.
