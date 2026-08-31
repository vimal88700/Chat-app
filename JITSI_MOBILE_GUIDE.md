# Orbit Chat Jitsi meeting upgrade — mobile steps

This upgrade changes the old basic one-to-one call buttons into a **Meet** button. When someone taps it, Orbit Chat opens a Jitsi meeting inside the app. Everyone using the same Orbit room code joins the same Jitsi meeting.

The Jitsi upgrade requires only one GitHub file replacement. You do not need to change Supabase tables or add another Render environment variable.

## 1. Download the updated file

Use the new `orbit-chat-upgrade.zip` attachment supplied with this message. Extract it on your phone using the Files app. Open the extracted folder, then open its `public` folder.

You need this file:

```text
public/index.html
```

Do not use the old `public/index.html` that you uploaded previously. Use the new one from the latest ZIP.

## 2. Replace `public/index.html` on GitHub using your phone

1. Open `https://github.com/vimal88700/Chat-app`.
2. Sign in to the GitHub account that can edit the repository.
3. Open the folder named **public**.
4. Confirm you are inside the `public` folder. The path should end with something like:

```text
Chat-app / public
```

5. Tap the existing file named **index.html**.
6. Tap the pencil/edit icon.
7. Delete the old contents. On most phones, tap inside the editor, choose **Select all**, and press **Delete**.
8. Open the extracted file `orbit-chat-upgrade/public/index.html` in a text viewer.
9. Choose **Select all → Copy**.
10. Return to the GitHub editor and paste the complete file.
11. Scroll to the bottom of the GitHub page.
12. Enter this commit message:

```text
Add Jitsi Meet-style group meetings
```

13. Tap **Commit changes**.

The final GitHub path must be:

```text
https://github.com/vimal88700/Chat-app/blob/main/public/index.html
```

Do not create `public/public/index.html`. Do not put the file in the repository root as `/index.html`.

## 3. Optional: update the whole package

The Jitsi meeting interface is inside `public/index.html`, so replacing that file is enough for the meeting button. If your earlier upload did not include the upgraded `server.js`, `package.json`, or other files, upload the complete package using the main mobile deployment guide as well. The Jitsi-specific change itself does not require a new server route.

## 4. Redeploy on Render

1. Open `https://dashboard.render.com`.
2. Open the **Chat-app** service.
3. Confirm the service is connected to `vimal88700 / Chat-app` and the `main` branch.
4. Tap **Manual Deploy**.
5. Tap **Deploy latest commit**.
6. Wait until the service says **Live**.

You do not need to add a variable named `JITSI_URL`. The app uses the public Jitsi domain `meet.jit.si` directly and loads its meeting library only when the user taps **Meet**.

## 5. Test the meeting from two phones or browsers

1. Open Orbit Chat on phone or browser A.
2. Enter a 6–8 digit room code, such as `12345678`, and enter a name.
3. Tap **Meet** at the top right.
4. Wait for the meeting panel to load.
5. Allow camera and microphone permissions when the browser asks.
6. Open Orbit Chat on phone or browser B.
7. Enter the same room code `12345678` with a different name.
8. Tap **Meet** on the second device.
9. Confirm both participants appear in the Jitsi meeting.

The meeting controls should include microphone, camera, chat, raise hand, tile view, full screen, settings, participant list, and leave meeting. Screen sharing appears only on browsers and devices that support the browser Screen Capture API. Mobile browsers may have fewer screen-sharing capabilities than desktop browsers.

## 6. What each button does

| Button | Function |
|---|---|
| **Meet** | Opens the multi-person Jitsi meeting for the current Orbit room |
| **Open full screen** | Opens the same meeting in a new browser tab if the embedded view is cramped |
| **Leave** | Closes the meeting and returns to Orbit Chat; it does not delete the room or messages |
| Jitsi microphone control | Mutes or unmutes your microphone |
| Jitsi camera control | Turns your camera on or off |
| Jitsi chat | Opens chat inside the meeting |
| Jitsi tile view | Shows participants in a grid |
| Jitsi participants | Displays the participant list |
| Jitsi screen share | Shares a tab, window, or screen where supported |

## 7. Important privacy and free-tier information

This integration uses the public `meet.jit.si` service. The Jitsi meeting name is derived from the Orbit room code, so anyone who knows the room code may attempt to join the corresponding meeting. Do not use ordinary room codes for sensitive meetings.

The Orbit Chat message database and Jitsi meeting are separate. Leaving a Jitsi meeting does not delete Orbit messages. Supabase still stores the text/media messages according to the retention configuration.

The new meeting library is loaded only after the user taps **Meet**, keeping the initial chat page lighter. A Jitsi meeting still uses network bandwidth and may not work when the user is offline. Calls require HTTPS and browser permission.

## 8. If the Meet button does not appear

Open the GitHub file path and confirm the new `public/index.html` was committed. Then redeploy the latest commit in Render. Open the website with a cache-busting query:

```text
https://chat-app-0che.onrender.com/?v=jitsi1
```

If the button appears but the meeting does not load, check the phone’s internet connection and open the **Open full screen** link. If the link also fails, the public Jitsi service or the network may be unavailable.

## References

[1]: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/ "Jitsi Meet IFrame API"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture "MDN Screen Capture API"
