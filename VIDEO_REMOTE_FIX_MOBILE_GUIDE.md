# Video call remote-video fix — mobile deployment

This patch fixes the video call screen so the **other participant’s video is the large main video** and your own camera is a small preview in the corner. It also shows the call controls while the call is connecting.

## Controls

The video call now shows:

```text
Mute   Speaker   Camera   Flip   Share   End
```

The **End** button is visible immediately while Connecting, so either person can cancel. The **Camera** button turns your outgoing video on or off. **Flip** switches between front and rear cameras when the device supports it. **Share** starts screen sharing when the browser supports `getDisplayMedia`.

## Files to replace

Replace exactly these two files on GitHub:

```text
/server.js
/public/index.html
```

`server.js` is in the repository root. `index.html` is inside the existing `public` folder.

## Mobile GitHub steps

1. Download `orbit-chat-video-remote-fix.zip`.
2. Open Files/My Files → Downloads.
3. Tap the ZIP → Extract/Unzip.
4. Open Chrome and visit `https://github.com/vimal88700/Chat-app`.
5. Open `server.js` → pencil/edit icon → Select all → Delete.
6. Open the extracted `server.js` → Select all → Copy.
7. Return to GitHub → Paste → commit as `Fix remote video and early call controls`.
8. Return to the repository file list.
9. Tap the existing `public` folder.
10. Confirm the path says `Chat-app / public`.
11. Open `index.html` → pencil/edit icon → Select all → Delete.
12. Open the extracted `public/index.html` → Select all → Copy.
13. Return to GitHub → Paste → commit as `Show remote video and call controls`.

Do not create `public/public/index.html`.

## Render steps

1. Open `https://dashboard.render.com`.
2. Open the **Chat-app** service.
3. Tap **Manual Deploy**.
4. Tap **Deploy latest commit**.
5. Wait for **Live**.
6. Open `https://chat-app-0che.onrender.com/?v=videoremote3` so the phone does not use an old cached HTML page.

No SQL migration and no new environment variable are required.

## Test with two devices

Use two phones or two different browsers in the same room code. Start a **Video call** from device A. The call surface and controls must appear immediately, even while it says Connecting. Device B should receive the incoming call dialog. Tap Accept and allow camera/microphone permission on both devices.

When connected, device A must see device B’s camera in the large main tile. Device A’s own camera must appear only in the small corner preview. Repeat in the other direction. Tap Camera to turn outgoing video off, Flip to switch cameras, and End from either device.

Screen sharing depends on browser support. On unsupported mobile browsers the app will show a message rather than pretending that sharing started.
