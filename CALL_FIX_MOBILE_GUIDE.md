# Mobile redeployment guide for the stuck call fix

The call bug was caused by the acceptor's PeerJS ID not being reliably sent back to the caller. The patched version waits for both browsers' PeerJS IDs, sends the acceptor ID explicitly, validates it on the server, and shows a clear error instead of leaving the call on Connecting forever.

From GitHub on your phone, replace these exact files:

```text
/server.js
/public/index.html
```

If `test_server.js` exists in your repository, replace it too:

```text
/test_server.js
```

No Supabase SQL change and no new Render environment variable is required for this call fix.

After committing the files, open Render, choose **Manual Deploy → Deploy latest commit**, and wait for **Live**. Test audio first with two different browsers or phones. Both users must be in the same 6–8 digit Orbit room. When the caller starts a call, the other user taps Accept, and the caller should then transition from Calling to Connected. Allow microphone/camera permission on both devices.

If it still fails, test the **Meet** button instead. The Meet button uses Jitsi and is the recommended group-meeting path. The old PeerJS call remains a small-room fallback and can still fail on restrictive VPN, corporate, school, carrier, or NAT networks because peer-to-peer calls need a reachable media path.
