# Meeting feature findings

The current Orbit Chat build has one-to-one peer signaling and a small call panel. It does not have a meeting-room media architecture, participant tile grid, active-speaker layout, moderator controls, screen sharing, chat panel within calls, or recording.

LiveKit documents a room/participant/track model in which rooms contain participants and participants publish or subscribe to audio, video, and data tracks. This is the architecture needed for multi-person meetings and moderation events: https://docs.livekit.io/intro/basics/rooms-participants-tracks/

LiveKit also documents screen sharing as a published video track, with browser permission and browser-specific audio-sharing limitations: https://docs.livekit.io/transport/media/screenshare/

Jitsi provides an embeddable IFrame API with a room name, mobile-browser support, participant controls, configuration overrides, and tile-view configuration. It is the fastest way to add a full meeting interface without implementing an SFU and all call controls inside Orbit Chat: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe/

MDN documents getDisplayMedia() for screen capture and notes that browser availability is not universal, so screen sharing needs a visible fallback and support messaging: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture

Recommendation: for a free-tier, mobile-first product, choose one of two implementation paths. Path A embeds a Jitsi meeting inside a modal or call page, keyed by the Orbit room code; this supplies Meet-like controls quickly but delegates meeting privacy and availability to Jitsi. Path B integrates an SFU such as LiveKit, adding backend token generation, room/participant management, participant tiles, active speaker events, screen share, device selection, moderation, and cleanup; this gives better product control but requires another media service and more operational complexity. The existing PeerJS mesh should remain only as a small-room fallback, not as the main group video architecture.

## Local implementation verification

The updated `public/index.html` now exposes a single `Meet` button in the room top bar. A local room smoke test successfully joined the room and displayed the new control. The Jitsi SDK is lazy-loaded only after tapping `Meet`, the room name is derived from the Orbit room code, and an Open full screen fallback link is provided. Actual third-party participant/camera testing requires the deployed HTTPS app and real browser permissions.

## Embedded SDK check

The local browser test confirmed that the Meet button opens the meeting modal and creates the expected `https://meet.jit.si/OrbitChat-<room-code>` full-screen fallback link. In the sandbox browser, `window.JitsiMeetExternalAPI` remained undefined and the dynamically inserted external script stayed in loading state; this indicates the sandbox could not complete the third-party Jitsi SDK load, not that the wrapper failed. The deployed HTTPS site should be tested on the user's phone, and the full-screen meeting link remains available if embedding is blocked.
