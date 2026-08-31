const express = require('express');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e6,
});

const PORT = Number(process.env.PORT || 3000);
function normalizeSupabaseUrl(value) {
  return String(value || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

const SUPABASE_URL = normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.SUPABASE_API_URL || '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET || 'chat-media';
const MAX_MESSAGE_LENGTH = 4000;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const ROOM_CODE_PATTERN = /^\d{6,8}$/;
const MEMORY_LIMIT = 1000;
const memoryMessages = new Map();

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

const MESSAGE_COLUMNS = 'id,room_code,sender_id,username,content,kind,media_url,media_name,media_type,media_size,created_at,edited_at,deleted_at,expires_at';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self)');
  next();
});
app.use(express.json({ limit: '512kb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: true,
}));

function cleanText(value, maxLength) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}

function validateRoomCode(value) {
  const code = cleanText(value, 8);
  return ROOM_CODE_PATTERN.test(code) ? code : null;
}

function validateName(value) {
  const name = cleanText(value, 40);
  return name.length >= 1 ? name : null;
}

function validateClientId(value) {
  const id = cleanText(value, 80);
  return /^[a-zA-Z0-9_-]{8,80}$/.test(id) ? id : null;
}

function allowedMime(mime) {
  return /^(image\/(jpeg|png|webp|gif)|video\/(mp4|webm|ogg)|audio\/(mpeg|mp4|ogg|webm|wav|aac|x-m4a))$/i.test(mime);
}

function extensionFor(mime, originalName = '') {
  const byMime = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/ogg': 'ogv',
    'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/webm': 'webm',
    'audio/wav': 'wav', 'audio/aac': 'aac', 'audio/x-m4a': 'm4a',
  };
  return byMime[mime] || path.extname(originalName).replace('.', '').toLowerCase().slice(0, 8) || 'bin';
}

function toClientMessage(row) {
  return {
    id: row.id,
    roomCode: row.room_code,
    senderId: row.sender_id,
    username: row.username,
    content: row.deleted_at ? 'Message deleted' : (row.content || ''),
    kind: row.kind || 'text',
    mediaUrl: row.media_url || null,
    mediaName: row.media_name || null,
    mediaType: row.media_type || null,
    mediaSize: row.media_size || null,
    createdAt: row.created_at || new Date().toISOString(),
    editedAt: row.edited_at || null,
    deletedAt: row.deleted_at || null,
    expiresAt: row.expires_at || null,
  };
}

function memoryForRoom(roomCode) {
  if (!memoryMessages.has(roomCode)) memoryMessages.set(roomCode, []);
  return memoryMessages.get(roomCode);
}

function rememberMessage(message) {
  const list = memoryForRoom(message.roomCode);
  list.push(message);
  while (list.length > MEMORY_LIMIT) list.shift();
}

function pruneMemory() {
  const now = Date.now();
  for (const [room, list] of memoryMessages.entries()) {
    const kept = list.filter((message) => !message.expiresAt || new Date(message.expiresAt).getTime() > now);
    if (kept.length) memoryMessages.set(room, kept);
    else memoryMessages.delete(room);
  }
}

async function cleanupExpiredMessages(roomCode = null) {
  pruneMemory();
  if (!supabase) return;
  let query = supabase.from('messages').delete().lt('expires_at', new Date().toISOString());
  if (roomCode) query = query.eq('room_code', roomCode);
  const { error } = await query;
  if (error && !String(error.message).toLowerCase().includes('expires_at')) {
    console.error('retention cleanup failed:', error.message);
  }
}

async function fetchMessages(roomCode) {
  await cleanupExpiredMessages(roomCode);
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .select(MESSAGE_COLUMNS)
      .eq('room_code', roomCode)
      .order('created_at', { ascending: true })
      .limit(100);
    if (!error && data) return data.map(toClientMessage);
    if (error) console.error('message history unavailable:', error.message);
  }
  return memoryForRoom(roomCode);
}

async function insertMessage(message) {
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        room_code: message.roomCode,
        sender_id: message.senderId,
        username: message.username,
        content: message.content,
        kind: message.kind,
        media_url: message.mediaUrl,
        media_name: message.mediaName,
        media_type: message.mediaType,
        media_size: message.mediaSize,
        expires_at: message.expiresAt,
      }])
      .select(MESSAGE_COLUMNS)
      .single();
    if (!error && data) return toClientMessage(data);
    if (error) console.error('message insert unavailable:', error.message);
  }
  const localMessage = {
    ...message,
    id: message.id || crypto.randomUUID(),
    createdAt: message.createdAt || new Date().toISOString(),
    editedAt: null,
    deletedAt: null,
  };
  rememberMessage(localMessage);
  return localMessage;
}

async function updateMessage(roomCode, id, senderId, updates) {
  if (supabase) {
    const { data, error } = await supabase
      .from('messages')
      .update(updates)
      .eq('id', id)
      .eq('room_code', roomCode)
      .eq('sender_id', senderId)
      .select(MESSAGE_COLUMNS)
      .single();
    if (!error && data) return toClientMessage(data);
    if (error) console.error('message update unavailable:', error.message);
  }
  const local = memoryForRoom(roomCode).find((message) => message.id === id && message.senderId === senderId);
  if (!local) return null;
  Object.assign(local, updates.edited_at ? { content: updates.content, editedAt: updates.edited_at } : { deletedAt: updates.deleted_at, content: 'Message deleted' });
  return local;
}

async function roomMembers(roomCode) {
  const sockets = await io.in(roomCode).fetchSockets();
  return sockets.map((peer) => ({
    id: peer.data.clientId,
    name: peer.data.username,
    peerId: peer.data.peerId || null,
    avatarUrl: peer.data.avatarUrl || null,
  })).filter((member) => member.id && member.name);
}

async function broadcastPresence(roomCode) {
  if (!roomCode) return;
  io.to(roomCode).emit('presence:update', await roomMembers(roomCode));
}

function emitError(socket, message) {
  socket.emit('app:error', { message });
}

app.get('/health', (req, res) => {
  res.json({ ok: true, databaseConfigured: Boolean(supabase), time: new Date().toISOString() });
});

app.get('/api/config', (req, res) => {
  res.json({
    maxUploadBytes: MAX_UPLOAD_BYTES,
    databaseConfigured: Boolean(supabase),
    mediaConfigured: Boolean(supabase),
    mediaBucket: MEDIA_BUCKET,
  });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const roomCode = validateRoomCode(req.body.roomCode || '000000');
    const senderId = validateClientId(req.body.senderId);
    const kind = req.body.kind === 'avatar' ? 'avatar' : 'media';
    if (!roomCode || !senderId) return res.status(400).json({ error: 'Invalid room or session.' });
    if (!req.file || !allowedMime(req.file.mimetype)) return res.status(400).json({ error: 'Unsupported file type.' });
    if (req.file.size > MAX_UPLOAD_BYTES) return res.status(413).json({ error: 'File is too large. Keep it under 12 MB.' });
    if (!supabase) return res.status(503).json({ error: 'Media storage is not configured yet.' });

    const ext = extensionFor(req.file.mimetype, req.file.originalname);
    const safeId = senderId.replace(/[^a-zA-Z0-9_-]/g, '');
    const folder = kind === 'avatar' ? 'avatars' : roomCode;
    const objectPath = `${folder}/${safeId}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(objectPath, req.file.buffer, {
      contentType: req.file.mimetype,
      cacheControl: '31536000',
      upsert: false,
    });
    if (uploadError) return res.status(502).json({ error: `Storage upload failed: ${uploadError.message}` });
    const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(objectPath);
    const url = publicData?.publicUrl || null;
    if (!url) return res.status(502).json({ error: 'Storage URL could not be created.' });
    res.json({ url, name: req.file.originalname, type: req.file.mimetype, size: req.file.size, kind });
  } catch (error) {
    console.error('upload failed:', error);
    res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({ error: 'Upload failed. Try a smaller file.' });
  }
});

app.post('/api/profile', async (req, res) => {
  const userId = validateClientId(req.body.userId);
  const username = validateName(req.body.username);
  const avatarUrl = cleanText(req.body.avatarUrl, 500);
  if (!userId || !username || !avatarUrl || !supabase) return res.status(400).json({ error: 'Profile could not be saved.' });
  const { error } = await supabase.from('profiles').upsert({ user_id: userId, username, avatar_url: avatarUrl, updated_at: new Date().toISOString() });
  if (error) return res.status(502).json({ error: 'Profile storage is not ready. Run the included SQL migration.' });
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  socket.on('joinRoom', async (payload = {}) => {
    const roomCode = validateRoomCode(payload.roomCode);
    const username = validateName(payload.username);
    const clientId = validateClientId(payload.clientId);
    const peerId = cleanText(payload.peerId, 120);
    if (!roomCode || !username || !clientId) return emitError(socket, 'Use a 6–8 digit room code and a nickname.');

    if (socket.data.roomCode) socket.leave(socket.data.roomCode);
    socket.data.roomCode = roomCode;
    socket.data.username = username;
    socket.data.clientId = clientId;
    socket.data.peerId = peerId;
    socket.data.avatarUrl = cleanText(payload.avatarUrl, 500);
    socket.join(roomCode);
    if (supabase) {
      const { error: roomError } = await supabase.rpc('ensure_room', { room_code_input: roomCode });
      if (roomError) console.error('room setup unavailable:', roomError.message);
    }

    const messages = await fetchMessages(roomCode);
    socket.emit('previousMessages', messages);
    socket.emit('room:ready', { roomCode, databaseConfigured: Boolean(supabase) });
    socket.to(roomCode).emit('systemMessage', `${username} joined the room`);
    await broadcastPresence(roomCode);
  });

  socket.on('peer:ready', (payload = {}) => {
    if (socket.data.clientId && payload.peerId) socket.data.peerId = cleanText(payload.peerId, 120);
    broadcastPresence(socket.data.roomCode);
  });

  socket.on('typing', (payload = {}) => {
    if (!socket.data.roomCode) return;
    socket.to(socket.data.roomCode).emit('typing:update', {
      clientId: socket.data.clientId,
      username: socket.data.username,
      isTyping: Boolean(payload.isTyping),
    });
  });

  socket.on('profile:update', async (payload = {}) => {
    const username = validateName(payload.username) || socket.data.username;
    const avatarUrl = cleanText(payload.avatarUrl, 500);
    socket.data.username = username;
    socket.data.avatarUrl = avatarUrl;
    if (supabase && avatarUrl) {
      const { error } = await supabase.from('profiles').upsert({
        user_id: socket.data.clientId,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      if (error) console.error('profile update unavailable:', error.message);
    }
    if (socket.data.roomCode) {
      io.to(socket.data.roomCode).emit('profile:updated', { userId: socket.data.clientId, username, avatarUrl });
      broadcastPresence(socket.data.roomCode);
    }
  });

  socket.on('sendMessage', async (payload = {}) => {
    const roomCode = socket.data.roomCode;
    const content = cleanText(payload.message, MAX_MESSAGE_LENGTH);
    if (!roomCode || roomCode !== validateRoomCode(payload.roomCode) || !content) return;
    const now = Date.now();
    if (socket.data.lastMessageAt && now - socket.data.lastMessageAt < 120) return emitError(socket, 'You are sending too quickly.');
    socket.data.lastMessageAt = now;
    const retentionDays = Math.max(0, Math.min(90, Number(payload.retentionDays || 30)));
    const expiresAt = retentionDays ? new Date(now + retentionDays * 86400000).toISOString() : null;
    const message = await insertMessage({
      roomCode,
      senderId: socket.data.clientId,
      username: socket.data.username,
      content,
      kind: 'text',
      mediaUrl: null,
      mediaName: null,
      mediaType: null,
      mediaSize: null,
      expiresAt,
      id: crypto.randomUUID(),
      createdAt: new Date(now).toISOString(),
    });
    io.to(roomCode).emit('newMessage', message);
    cleanupExpiredMessages(roomCode);
  });

  socket.on('sendMedia', async (payload = {}) => {
    const roomCode = socket.data.roomCode;
    const url = cleanText(payload.url, 1000);
    const mediaType = cleanText(payload.type, 120);
    const mediaName = cleanText(payload.name, 180);
    const kind = ['image', 'video', 'audio'].includes(payload.kind) ? payload.kind : 'file';
    if (!roomCode || roomCode !== validateRoomCode(payload.roomCode) || !url || !allowedMime(mediaType)) return emitError(socket, 'That media could not be shared.');
    const retentionDays = Math.max(0, Math.min(90, Number(payload.retentionDays || 30)));
    const message = await insertMessage({
      roomCode, senderId: socket.data.clientId, username: socket.data.username, content: '', kind,
      mediaUrl: url, mediaName, mediaType, mediaSize: Number(payload.size || 0),
      expiresAt: retentionDays ? new Date(Date.now() + retentionDays * 86400000).toISOString() : null,
      id: crypto.randomUUID(), createdAt: new Date().toISOString(),
    });
    io.to(roomCode).emit('newMessage', message);
  });

  socket.on('editMessage', async (payload = {}) => {
    const roomCode = socket.data.roomCode;
    const content = cleanText(payload.content, MAX_MESSAGE_LENGTH);
    if (!roomCode || !payload.id || !content) return;
    const message = await updateMessage(roomCode, cleanText(payload.id, 80), socket.data.clientId, { content, edited_at: new Date().toISOString() });
    if (message) io.to(roomCode).emit('message:updated', message);
  });

  socket.on('deleteMessage', async (payload = {}) => {
    const roomCode = socket.data.roomCode;
    if (!roomCode || !payload.id) return;
    const message = await updateMessage(roomCode, cleanText(payload.id, 80), socket.data.clientId, { deleted_at: new Date().toISOString() });
    if (message) io.to(roomCode).emit('message:updated', message);
  });

  socket.on('call-request', (payload = {}) => {
    const roomCode = socket.data.roomCode;
    const callerPeerId = cleanText(payload.peerId, 120);
    const callId = cleanText(payload.callId, 80) || crypto.randomUUID();
    if (!roomCode || !callerPeerId) return emitError(socket, 'Calling is not ready yet.');
    socket.data.peerId = callerPeerId;
    socket.to(roomCode).emit('incoming-call', {
      callId, callerId: socket.data.clientId, callerPeerId, callerName: socket.data.username,
      video: Boolean(payload.video),
    });
    broadcastPresence(roomCode);
  });

  socket.on('call-accept', async (payload = {}) => {
    const roomCode = socket.data.roomCode;
    const callerPeerId = cleanText(payload.callerPeerId, 120);
    const acceptorPeerId = cleanText(payload.acceptorPeerId || socket.data.peerId, 120);
    if (!roomCode || !callerPeerId || !acceptorPeerId) {
      return emitError(socket, 'Call setup is not ready yet. Please try again.');
    }
    socket.data.peerId = acceptorPeerId;
    const peers = await io.in(roomCode).fetchSockets();
    const caller = peers.find((peer) => peer.data.peerId === callerPeerId);
    if (caller) {
      caller.emit('call-accepted', {
        callId: cleanText(payload.callId, 80), acceptorPeerId,
        acceptorName: socket.data.username, video: Boolean(payload.video),
      });
    } else {
      emitError(socket, 'The caller is no longer connected.');
    }
  });

  socket.on('call-ended', (payload = {}) => {
    if (socket.data.roomCode) socket.to(socket.data.roomCode).emit('call-ended', { callId: cleanText(payload.callId, 80), clientId: socket.data.clientId });
  });

  socket.on('disconnect', () => {
    const roomCode = socket.data.roomCode;
    if (roomCode) {
      socket.to(roomCode).emit('systemMessage', `${socket.data.username || 'Someone'} left the room`);
      broadcastPresence(roomCode);
    }
  });
});

setInterval(() => cleanupExpiredMessages(), 6 * 60 * 60 * 1000).unref();
server.listen(PORT, () => console.log(`Orbit Chat listening on ${PORT}`));
