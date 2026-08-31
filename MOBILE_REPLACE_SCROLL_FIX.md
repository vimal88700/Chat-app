# Exact mobile instructions: replace the fixed Orbit Chat files

Follow these steps slowly. You only need to replace two files for the scrolling and call fixes:

```text
server.js
public/index.html
```

The first file belongs in the **repository root**. The second file belongs inside the **public folder**.

> Do not upload the ZIP itself into GitHub. Open/extract the ZIP first, then upload the files inside it.

## Part 1 — Download the new ZIP on your phone

1. Tap the attachment named `orbit-chat-upgrade-scroll-fix.zip` in this chat.
2. Tap the download icon or choose **Download**.
3. Open your phone’s **Files**, **My Files**, or **File Manager** app.
4. Open **Downloads**.
5. Find `orbit-chat-upgrade-scroll-fix.zip`.
6. Tap the ZIP and choose **Extract**, **Unzip**, or **Extract here**.
7. Open the extracted folder.

Inside the extracted folder you should see `server.js` directly. You should also see a folder named `public`. Open that folder and you should see `index.html`.

The correct local arrangement is:

```text
extracted-folder/
├── server.js
└── public/
    └── index.html
```

Do not rename `server.js`. Do not rename `index.html`.

## Part 2 — Open your GitHub repository

1. Open Chrome or Safari.
2. Visit `https://github.com`.
3. Sign in to the GitHub account that owns or can edit `vimal88700/Chat-app`.
4. Open `https://github.com/vimal88700/Chat-app`.
5. If the page is difficult to use, open the browser menu and enable **Desktop site**.

You should see the repository file list and the branch name, normally `main`.

## Part 3 — Replace `server.js`

`server.js` is in the main repository folder, also called the **root**. It is not inside `public`.

1. On the repository page, tap the file named **server.js**.
2. Tap the pencil icon or **Edit this file**.
3. Tap inside the code editor.
4. Choose **Select all**.
5. Press **Delete** or **Backspace** until the editor is empty.
6. Open the extracted ZIP folder in another Files tab or app.
7. Open the extracted `server.js`.
8. Choose **Select all → Copy**.
9. Return to the GitHub editor.
10. Tap inside the empty editor and choose **Paste**.
11. Scroll to the bottom of the GitHub page.
12. In the commit message box, type:

```text
Fix call connection handshake
```

13. Select **Commit directly to the main branch** if GitHub asks.
14. Tap **Commit changes**.

Wait until GitHub returns to the file page. You have now replaced the root file:

```text
/server.js
```

## Part 4 — Replace `public/index.html`

Now replace the HTML file inside the `public` folder.

1. Return to the repository file list. You can tap the repository name or the breadcrumb at the top.
2. Tap the folder named **public**.
3. Confirm the breadcrumb says:

```text
Chat-app / public
```

4. Tap the existing file named **index.html**.
5. Tap the pencil icon or **Edit this file**.
6. Tap inside the editor.
7. Choose **Select all**.
8. Press **Delete** or **Backspace**.
9. Open the extracted folder on your phone.
10. Open its `public` folder.
11. Open the extracted `index.html`.
12. Choose **Select all → Copy**.
13. Return to the GitHub editor.
14. Tap inside the empty editor and choose **Paste**.
15. Scroll to the bottom.
16. Type this commit message:

```text
Fix mobile scrolling and composer
```

17. Choose **Commit directly to the main branch** if shown.
18. Tap **Commit changes**.

The final GitHub location must be:

```text
https://github.com/vimal88700/Chat-app/blob/main/public/index.html
```

The file must not be placed at any of these incorrect locations:

```text
/index.html
/public/public/index.html
/public/index.html/index.html
```

## Part 5 — Optional test file

If your GitHub repository contains a file named `test_server.js`, you may replace it with the patched `test_server.js` from the ZIP. It is only a test file and is not required for the website to run.

Do not delete `package.json`. Do not delete `package-lock.json`. Do not upload `node_modules`.

## Part 6 — Redeploy on Render

1. Visit `https://dashboard.render.com`.
2. Sign in.
3. Open the service named **Chat-app**.
4. Confirm the service is connected to `vimal88700 / Chat-app`.
5. Confirm the branch is `main`.
6. Tap **Manual Deploy** near the top.
7. Choose **Deploy latest commit**.
8. Wait for the deployment log to finish.
9. Wait until the status says **Live**.

If Render automatically starts a deployment after the GitHub commit, still wait until it says **Live**. Do not start several deployments at the same time.

## Part 7 — Clear the old page on your phone

After Render says **Live**, open this exact address:

```text
https://chat-app-0che.onrender.com/?v=scrollfix2
```

The extra `?v=scrollfix2` forces the browser to request a fresh page instead of using the old cached HTML.

If you still see the old behavior, close the tab completely, open Chrome/Safari settings, clear the site data for `chat-app-0che.onrender.com`, and open the cache-busting address again.

## Part 8 — Test the scrolling fix

1. Enter a room code with 6–8 digits.
2. Enter your name.
3. Enter the room.
4. Send many messages until they fill the screen.
5. Confirm the message box remains visible at the bottom.
6. Swipe up inside the message history to read older messages.
7. Confirm the history scrolls independently.
8. Confirm a `↓ Latest` button appears when you are away from the newest message.
9. Tap `↓ Latest` and confirm the view returns to the newest message.
10. Send another message and confirm it appears at the bottom.

## Part 9 — Test the call fix afterward

Use two different phones or two different browsers. Put both users in the same room.

1. Test audio call first.
2. Allow microphone permission on both devices.
3. Tap the call button on the first device.
4. Tap **Accept** on the second device.
5. Wait for the call to change from **Connecting** to **Connected**.
6. End the audio call.
7. Test video call.
8. Allow camera permission on both devices.

For larger meetings, use the **Meet** button, which opens the Jitsi group meeting interface.

## Common mistakes

| Mistake | Correct action |
|---|---|
| Uploading the ZIP directly | Extract the ZIP first |
| Putting `server.js` inside `public` | Keep it in the repository root |
| Putting `index.html` in the root | Put it inside `/public` |
| Creating `public/public/index.html` | Open the existing `public` folder and replace its `index.html` |
| Editing the wrong branch | Commit to the branch Render uses, normally `main` |
| Forgetting Render deployment | Use **Manual Deploy → Deploy latest commit** |
| Seeing the old page | Open the `?v=scrollfix2` cache-busting URL |
| Uploading `.env` or secret keys | Never upload secrets to GitHub |
| Testing calls in one browser tab | Use two separate devices or browsers |

The scrolling fix does not require a new Supabase SQL migration or a new Render environment variable. It is contained in the updated `public/index.html`. The call-handshake fix requires the updated `server.js` and `public/index.html` together.
