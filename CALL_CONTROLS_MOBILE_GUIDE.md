# Updated call controls — mobile deployment

This update keeps Orbit Chat as a **no-login messaging app** and improves the in-app calls.

## Audio call controls

An audio call shows only:

```text
Mute   Speaker   End
```

The camera, flip, and screen-share controls are hidden during an audio call.

## Video call controls

A video call shows:

```text
Mute   Speaker   Camera   Flip   Share   End
```

Both the caller and the person who accepts can tap **End**. The call no longer depends on a separate meeting screen.

## Replace these two GitHub files

Use the newest package and replace:

```text
/server.js
/public/index.html
```

The backend file is in the main repository folder. The HTML file is inside the existing `public` folder.

## Mobile steps

1. Download `orbit-chat-call-controls.zip`.
2. Open Files/My Files → Downloads.
3. Tap the ZIP → Extract/Unzip.
4. Open Chrome and visit `https://github.com/vimal88700/Chat-app`.
5. Open `server.js` → pencil icon → Select all → Delete.
6. Open the extracted `server.js` → Select all → Copy.
7. Return to GitHub → Paste → commit as `Improve call controls`.
8. Return to the repository file list.
9. Open the `public` folder.
10. Open the existing `index.html` → pencil icon → Select all → Delete.
11. Open the extracted `public/index.html` → Select all → Copy.
12. Return to GitHub → Paste → commit as `Add call controls and screen share`.

The correct final paths are:

```text
Chat-app/server.js
Chat-app/public/index.html
```

Do not create `public/public/index.html`.

## Render deployment

1. Open `https://dashboard.render.com`.
2. Open the **Chat-app** service.
3. Tap **Manual Deploy**.
4. Tap **Deploy latest commit**.
5. Wait until the service says **Live**.
6. Open `https://chat-app-0che.onrender.com/?v=callcontrols2` to avoid an old cached page.

No SQL migration and no new environment variable are required.

## Test

Use two devices or two browsers in the same room. Test audio first. Start **Audio call**, accept it on the other device, and confirm only Mute, Speaker, and End are shown. Then end it.

Start **Video call**, accept it, and confirm Camera, Flip, Share, and End appear. Camera flip requires a device with another camera. Screen sharing requires browser support; many mobile browsers may not offer `getDisplayMedia`, so the app will show a clear unsupported message instead of failing silently.
