const assert = require('assert');
const { spawn } = require('child_process');
const { io: connect } = require('socket.io-client');

const port = 3300;
const child = spawn(process.execPath, ['server.js'], { cwd: __dirname, env: { ...process.env, PORT: String(port), SUPABASE_URL: '', SUPABASE_ANON_KEY: '' }, stdio: ['ignore', 'pipe', 'pipe'] });

function once(socket, event, predicate = () => true, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), timeout);
    const handler = (payload) => {
      if (!predicate(payload)) return;
      clearTimeout(timer); socket.off(event, handler); resolve(payload);
    };
    socket.on(event, handler);
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { const response = await fetch(`http://127.0.0.1:${port}/health`); if (response.ok) return; } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Server did not start');
}

(async () => {
  await waitForServer();
  const alice = connect(`http://127.0.0.1:${port}`, { transports: ['websocket'] });
  const bob = connect(`http://127.0.0.1:${port}`, { transports: ['websocket'] });
  await Promise.all([once(alice, 'connect'), once(bob, 'connect')]);
  const room = '87654321';
  alice.emit('joinRoom', { roomCode: room, username: 'Alice', clientId: 'client-alice', peerId: 'peer-alice' });
  bob.emit('joinRoom', { roomCode: room, username: 'Bob', clientId: 'client-bob', peerId: 'peer-bob' });
  await Promise.all([once(alice, 'previousMessages'), once(bob, 'previousMessages')]);
  const presence = await once(alice, 'presence:update', (members) => members.length === 2);
  assert.equal(presence.length, 2);

  const received = once(bob, 'newMessage', (message) => message.content === 'Hello group');
  alice.emit('sendMessage', { roomCode: room, message: 'Hello group', retentionDays: 30 });
  const sent = await received;
  assert.equal(sent.senderId, 'client-alice');

  const updated = once(bob, 'message:updated', (message) => message.content === 'Edited group message');
  alice.emit('editMessage', { id: sent.id, content: 'Edited group message' });
  assert.equal((await updated).editedAt ? true : false, true);

  const deleted = once(bob, 'message:updated', (message) => Boolean(message.deletedAt));
  alice.emit('deleteMessage', { id: sent.id });
  assert.ok((await deleted).deletedAt);

  const typing = once(alice, 'typing:update', (payload) => payload.username === 'Bob' && payload.isTyping);
  bob.emit('typing', { isTyping: true });
  assert.equal((await typing).clientId, 'client-bob');

  const incoming = once(bob, 'incoming-call');
  const accepted = once(alice, 'call-accepted');
  alice.emit('call-request', { peerId: 'peer-alice', callId: 'call-1', video: true });
  assert.equal((await incoming).callerPeerId, 'peer-alice');
  bob.emit('call-accept', { callerPeerId: 'peer-alice', acceptorPeerId: 'peer-bob', callId: 'call-1', video: true });
  assert.equal((await accepted).acceptorPeerId, 'peer-bob');

  alice.disconnect(); bob.disconnect(); child.kill();
  console.log('Orbit Chat server integration test passed');
})().catch((error) => { console.error(error); child.kill(); process.exitCode = 1; });
