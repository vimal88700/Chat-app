const assert = require('assert');
const http = require('http');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');

const httpServer = http.createServer();
const server = new Server(httpServer, { transports: ['websocket'] });
const room = '87654321';

server.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomCode, username, clientId, peerId }) => {
    socket.data.roomCode = roomCode;
    socket.data.username = username;
    socket.data.clientId = clientId;
    socket.data.peerId = peerId;
    socket.join(roomCode);
    socket.emit('previousMessages', []);
    const members = [...server.sockets.adapter.rooms.get(roomCode)].map((id) => server.sockets.sockets.get(id).data);
    server.to(roomCode).emit('presence:update', members.map((member) => ({ id: member.clientId, name: member.username, peerId: member.peerId })));
  });
  socket.on('typing', (payload) => socket.to(socket.data.roomCode).emit('typing:update', { clientId: socket.data.clientId, username: socket.data.username, isTyping: Boolean(payload.isTyping) }));
  socket.on('sendMessage', (payload) => { const message = { id: 'message-1', senderId: socket.data.clientId, username: socket.data.username, content: payload.message, kind: 'text', createdAt: new Date().toISOString() }; server.to(socket.data.roomCode).emit('newMessage', message); });
  socket.on('editMessage', (payload) => server.to(socket.data.roomCode).emit('message:updated', { id: payload.id, senderId: socket.data.clientId, username: socket.data.username, content: payload.content, kind: 'text', editedAt: new Date().toISOString() }));
  socket.on('deleteMessage', (payload) => server.to(socket.data.roomCode).emit('message:updated', { id: payload.id, senderId: socket.data.clientId, username: socket.data.username, content: 'Message deleted', kind: 'text', deletedAt: new Date().toISOString() }));
  socket.on('call-request', (payload) => socket.to(socket.data.roomCode).emit('incoming-call', { callId: payload.callId, callerPeerId: payload.peerId, callerName: socket.data.username, video: payload.video }));
  socket.on('call-accept', (payload) => { const target = [...server.sockets.sockets.values()].find((candidate) => candidate.data.peerId === payload.callerPeerId); if (target) target.emit('call-accepted', { callId: payload.callId, acceptorPeerId: socket.data.peerId, acceptorName: socket.data.username, video: payload.video }); });
});

function once(socket, event, predicate = () => true, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${event}`)), timeout);
    socket.on(event, function handler(payload) {
      if (!predicate(payload)) return;
      clearTimeout(timer); socket.off(event, handler); resolve(payload);
    });
  });
}

(async () => {
  await new Promise((resolve) => httpServer.listen(3200, resolve));
  const alice = connect('http://127.0.0.1:3200', { transports: ['websocket'] });
  const bob = connect('http://127.0.0.1:3200', { transports: ['websocket'] });
  await Promise.all([once(alice, 'connect'), once(bob, 'connect')]);
  const alicePresence = once(alice, 'presence:update', (members) => members.length === 2);
  alice.emit('joinRoom', { roomCode: room, username: 'Alice', clientId: 'client-alice', peerId: 'peer-alice' });
  bob.emit('joinRoom', { roomCode: room, username: 'Bob', clientId: 'client-bob', peerId: 'peer-bob' });
  assert.equal((await once(alice, 'previousMessages')).length, 0);
  assert.equal((await once(bob, 'previousMessages')).length, 0);
  assert.equal((await alicePresence).length, 2);

  const incomingMessage = once(bob, 'newMessage', (message) => message.content === 'Hello group');
  alice.emit('sendMessage', { roomCode: room, message: 'Hello group' });
  assert.equal((await incomingMessage).senderId, 'client-alice');

  const edited = once(bob, 'message:updated', (message) => message.content === 'Edited group message');
  alice.emit('editMessage', { id: 'message-1', content: 'Edited group message' });
  assert.equal((await edited).content, 'Edited group message');

  const deleted = once(bob, 'message:updated', (message) => Boolean(message.deletedAt));
  alice.emit('deleteMessage', { id: 'message-1' });
  assert.ok((await deleted).deletedAt);

  const typing = once(alice, 'typing:update', (payload) => payload.username === 'Bob' && payload.isTyping);
  bob.emit('typing', { isTyping: true });
  assert.equal((await typing).clientId, 'client-bob');

  const incomingCall = once(bob, 'incoming-call');
  const accepted = once(alice, 'call-accepted');
  alice.emit('call-request', { peerId: 'peer-alice', callId: 'call-1', video: true });
  assert.equal((await incomingCall).callerPeerId, 'peer-alice');
  bob.emit('call-accept', { callerPeerId: 'peer-alice', callId: 'call-1', video: true });
  assert.equal((await accepted).acceptorPeerId, 'peer-bob');

  alice.disconnect(); bob.disconnect(); server.close(); httpServer.close();
  console.log('Socket.IO integration test passed');
})().catch((error) => { console.error(error); server.close(); httpServer.close(); process.exitCode = 1; });
