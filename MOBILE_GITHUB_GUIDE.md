# Mobile-only guide: exactly where to put every Orbit Chat file

This guide is for doing the GitHub part from an Android phone or iPhone. You do not need to understand the code. You only need to put each file in the correct place.

> **The most important rule:** files such as `server.js` go in the repository’s main/root folder. Files such as `public/index.html` go inside the existing `public` folder. Do not upload the whole extracted folder as a new folder inside GitHub.

## Part A — Download and extract the ZIP on your phone

### Android

1. Open the previous message and tap the attachment named `orbit-chat-upgrade.zip`.
2. Choose **Download** if your browser asks.
3. Open the Android **Files**, **Files by Google**, or **My Files** app.
4. Open **Downloads**.
5. Tap `orbit-chat-upgrade.zip`.
6. Choose **Extract** or **Extract to orbit-chat-upgrade**.
7. Open the new extracted folder. You should see files such as `server.js`, `package.json`, `README.md`, and a folder named `public`.

### iPhone

1. Tap the `orbit-chat-upgrade.zip` attachment in the previous message and download it.
2. Open Apple’s **Files** app.
3. Tap **Browse → Downloads**.
4. Tap `orbit-chat-upgrade.zip` once. iPhone will create and open an extracted folder with the same name.
5. Open that extracted folder. You should see `server.js`, `package.json`, `README.md`, and the `public` folder.

If your phone cannot open the ZIP, install a trusted file manager that supports ZIP extraction. Do not install a random application that asks for your GitHub or Supabase password.

## Part B — Open the correct GitHub repository

1. Open Chrome or Safari.
2. Visit `https://github.com/vimal88700/Chat-app`.
3. Sign in to the GitHub account that owns or can edit this repository.
4. If the page looks cramped, open the browser menu and enable **Desktop site** or **Request Desktop Website**.
5. Confirm that the page title says **Chat-app** and the owner says **vimal88700**.

If you cannot see **Add file**, you are either not signed in to the correct account or you do not have write permission. Do not create a different repository by mistake.

## Part C — Upload the root files first

The **root** means the first page of the repository, where you can see files like the existing `server.js` and `package.json`.

1. On the repository page, tap **Add file**.
2. Tap **Upload files**.
3. Your phone’s file picker will open.
4. Go to the extracted `orbit-chat-upgrade` folder.
5. Select these files that are directly inside that extracted folder:

| File to select | Where it must appear in GitHub | What to do |
|---|---|---|
| `server.js` | `/server.js` | Replace the existing file |
| `package.json` | `/package.json` | Replace the existing file |
| `package-lock.json` | `/package-lock.json` | Add or replace |
| `README.md` | `/README.md` | Replace the existing file |
| `supabase_schema.sql` | `/supabase_schema.sql` | Add this file |
| `.env.example` | `/.env.example` | Add this file; it is only a template |
| `.gitignore` | `/.gitignore` | Add or replace |
| `DELIVERY_NOTES.md` | `/DELIVERY_NOTES.md` | Optional documentation |
| `test_server.js` | `/test_server.js` | Optional testing file |

Do **not** select the `public` folder in this step. We will upload its files separately.

6. Scroll down to the commit section.
7. Choose **Commit directly to the `main` branch** if that is the branch Render already uses.
8. In the message box, type:

```text
Upgrade Orbit Chat backend and root configuration
```

9. Tap **Commit changes** or **Commit changes directly to main**.
10. Wait for GitHub to finish. Do not press the button repeatedly.

### If your phone does not show hidden files

Some mobile file pickers hide names beginning with a dot, such as `.env.example` and `.gitignore`. Add them manually through GitHub:

1. Go back to the repository root.
2. Tap **Add file → Create new file**.
3. In the filename box, type `.env.example`.
4. Open the extracted file `.env.example` in a text viewer and copy its contents.
5. Paste the contents into GitHub.
6. Commit the file.
7. Repeat the same process for `.gitignore`.

The filename must be exactly `.env.example`, not `.env.example.txt`. The filename must be exactly `.gitignore`, not `.gitignore.txt`.

## Part D — Upload the `public` files into the `public` folder

The two browser files must go inside GitHub’s existing `public` folder.

1. Return to the repository root page.
2. Tap the folder named **public**. You should now see the existing `index.html`.
3. Confirm the address/path near the top ends with `/Chat-app/tree/main/public` or otherwise shows that you are inside `public`.
4. Tap **Add file → Upload files**.
5. Open the extracted folder, then open its `public` folder.
6. Select exactly these two files:

| File to select | Where it must appear in GitHub |
|---|---|
| `index.html` | `/public/index.html` |
| `sw.js` | `/public/sw.js` |

7. Scroll down.
8. Use the commit message:

```text
Upgrade Orbit Chat browser interface
```

9. Tap **Commit changes**.

### If the `public` folder is missing

Do not upload `index.html` to the repository root. Instead:

1. Open the repository root.
2. Tap **Add file → Create new file**.
3. In the filename box, type `public/index.html`.
4. Copy the complete contents from the extracted `public/index.html` file and paste them into GitHub.
5. Commit it.
6. Repeat with filename `public/sw.js`.

GitHub uses the slash in `public/index.html` to create the correct folder path.

## Part E — Check that every file is in the right place

Open the repository root and compare it with this exact layout:

```text
Chat-app/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── server.js
├── supabase_schema.sql
├── public/
│   ├── index.html
│   └── sw.js
└── test_server.js              optional
```

The following locations are **wrong**:

```text
Chat-app/orbit-chat-upgrade/server.js
Chat-app/public/public/index.html
Chat-app/index.html
Chat-app/server/server.js
```

If you see `Chat-app/orbit-chat-upgrade/server.js`, open that folder and move/upload the files again at the repository root. Render will fail if `package.json` is hidden inside a second folder.

## Part F — Do not upload secret files

Never upload any file named `.env` containing real values. Only upload `.env.example`, which contains placeholder text. Do not upload the Supabase service-role key. The current Supabase anon/publishable key should be entered only in Render’s private Environment settings.

Because the old legacy key was shared in the conversation and returned an authorization error during testing, use the current key from **Supabase → Project Settings → API**.

## Part G — Confirm GitHub is ready for Render

Open the root `package.json` on GitHub and confirm it is the upgraded version. You should see a start command similar to:

```json
"start": "node server.js"
```

Open `public/index.html` and confirm it is the new Orbit Chat interface, not the old prototype. If these two files are correct and located at the paths above, Render can find the application.

## Part H — After GitHub: Supabase from mobile

1. Open the Supabase dashboard in Chrome or Safari.
2. Select your project.
3. Open **SQL Editor**.
4. Tap **New query**.
5. Open `supabase_schema.sql` from the downloaded package using your phone’s text viewer.
6. Tap **Select all → Copy**.
7. Return to Supabase SQL Editor and paste the entire file.
8. Tap **Run**.
9. Open **Table Editor** and confirm that `rooms`, `profiles`, and `messages` exist.
10. Open **Storage → Buckets** and confirm that `chat-media` exists.
11. Open **Project Settings → API** and copy the current Project URL and anon/publishable key. Keep them ready for Render.

Do not run only part of the SQL file. Copy from the first line to the last line.

## Part I — After GitHub: Render from mobile

1. Open `https://dashboard.render.com`.
2. Sign in and open the service that hosts `chat-app-0che`.
3. Open **Environment**.
4. Add or update these exact variables:

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://tmesumqbayplvypqdcqd.supabase.co` |
| `SUPABASE_ANON_KEY` | The current anon/publishable key copied from Supabase |
| `SUPABASE_MEDIA_BUCKET` | `chat-media` |
| `CLIENT_ORIGIN` | `https://chat-app-0che.onrender.com` |
| `PORT` | `3000` |

5. Open the service **Settings** and confirm:
   - Build command: `npm install`
   - Start command: `npm start`
   - Root directory: blank, unless your repository intentionally uses a subfolder
   - Branch: the branch where you committed the new files, normally `main`
6. Tap **Save changes**.
7. Tap **Manual Deploy → Deploy latest commit**.
8. Wait until Render displays **Live**.

## Part J — Test from your phone

Open:

```text
https://chat-app-0che.onrender.com/health
```

You should see JSON containing:

```json
"ok": true
```

Then open the main website and test these items:

| Test | Expected result |
|---|---|
| Enter a 6–8 digit room code | Chat room opens |
| Open the same code on a second browser | Both users appear in People here |
| Send text | Other browser receives it |
| Tap plus button and choose a small image | Image appears in chat |
| Open Change appearance | Themes and accent color work |
| Open Message retention | Retention choices appear |
| Try audio call | Browser requests microphone permission |

If Render is still showing the old interface, wait for the deploy to finish, then open the website with a cache-busting address such as `https://chat-app-0che.onrender.com/?v=2` and refresh.

## The one thing to remember

When uploading files, always ask yourself: **“Is this a root file or a public-folder file?”**

| If the file is... | Upload it here |
|---|---|
| `server.js`, `package.json`, `README.md`, `.env.example`, `.gitignore`, `supabase_schema.sql` | Repository root: `/` |
| `index.html`, `sw.js` | Inside the `public` folder: `/public/` |

If you want, send a screenshot of your GitHub repository file list after uploading. I can tell you whether each file is in the correct place before you deploy Render.
