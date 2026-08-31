# Mobile fix: message bar disappearing and no scrolling

The updated `public/index.html` fixes the mobile chat layout. The message history now scrolls inside its own area, the composer remains visible at the bottom, and a `↓ Latest` button appears when you are reading older messages.

## Replace this file on GitHub

From your phone, open the repository and open the `public` folder:

```text
Chat-app / public / index.html
```

Open `index.html`, tap the pencil/edit icon, replace all of its contents with the updated `public/index.html` from the latest ZIP, and commit the change.

Do not put the file in the repository root. The correct location is:

```text
/public/index.html
```

## Redeploy Render

Open Render, open the **Chat-app** service, tap **Manual Deploy**, and choose **Deploy latest commit**. Wait for the service to show **Live**.

To avoid the phone using the old cached page, open:

```text
https://chat-app-0che.onrender.com/?v=scrollfix1
```

## Test

Enter a room and send enough messages to fill the screen. The bottom message box should remain visible. Swipe up inside the message history to read older messages. A `↓ Latest` button should appear; tap it to return to the newest messages.

This fix does not require any Supabase SQL change or new Render environment variable.
