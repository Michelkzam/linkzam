const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const archiver = require('archiver');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Serve static files (your HTML/CSS/JS frontend)
app.use(express.static(path.join(__dirname)));

// Ensure data folder
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, 'linkzam.db');
let db;

async function initDb() {
  db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  role TEXT
);

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  cnpj TEXT,
  slaPlan TEXT
);

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clientId INTEGER,
  name TEXT,
  serial TEXT,
  FOREIGN KEY(clientId) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS remote_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deviceId INTEGER,
  status TEXT DEFAULT 'starting',
  sessionToken TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  lastPing DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(deviceId) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  status TEXT DEFAULT 'Novo',
  priority TEXT DEFAULT 'Normal',
  clientId INTEGER,
  deviceId INTEGER,
  chatId TEXT,
  category TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(clientId) REFERENCES clients(id),
  FOREIGN KEY(deviceId) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticketId INTEGER,
  chatId TEXT,
  sender TEXT,
  senderRole TEXT,
  content TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(ticketId) REFERENCES tickets(id)
);

CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  enabled INTEGER DEFAULT 0,
  config TEXT
);
`);

// Helpers
const run = db.prepare;

// API: Tickets
app.get('/api/tickets', (req, res) => {
  const chatId = req.query.chatId;
  let rows;
  if (chatId) rows = db.prepare('SELECT * FROM tickets WHERE chatId = ? ORDER BY createdAt DESC').all(chatId);
  else rows = db.prepare('SELECT * FROM tickets ORDER BY createdAt DESC').all();
  res.json(rows);
});

app.post('/api/tickets', (req, res) => {
  const { title, priority, clientId, deviceId, chatId, category } = req.body;
  const stmt = db.prepare('INSERT INTO tickets (title, priority, clientId, deviceId, chatId, category) VALUES (?,?,?,?,?,?)');
  const info = stmt.run(title || 'Ticket via Chat', priority || 'Normal', clientId || null, deviceId || null, chatId || null, category || null);
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(info.lastInsertRowid);
  res.json(ticket);
});

app.patch('/api/tickets/:id', (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const updates = [];
  const values = [];
  for (const k of Object.keys(fields)) {
    updates.push(`${k} = ?`);
    values.push(fields[k]);
  }
  if (updates.length === 0) return res.status(400).json({ error: 'no fields' });
  values.push(id);
  db.prepare(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
  io.emit('ticket:update', ticket);
  res.json(ticket);
});

// API: Messages
app.get('/api/messages', (req, res) => {
  const chatId = req.query.chatId;
  if (!chatId) return res.json([]);
  const rows = db.prepare('SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt ASC').all(chatId);
  res.json(rows);
});

// Create message via HTTP (socket also sends messages)
app.post('/api/messages', (req, res) => {
  const { ticketId, chatId, sender, senderRole, content } = req.body;
  const stmt = db.prepare('INSERT INTO messages (ticketId, chatId, sender, senderRole, content) VALUES (?,?,?,?,?)');
  const info = stmt.run(ticketId || null, chatId || null, sender || 'Anon', senderRole || 'user', content || '');
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);

  // If operator sent message, auto-update ticket status
  if (senderRole === 'operator' && ticketId) {
    db.prepare("UPDATE tickets SET status = 'Aguardando Cliente' WHERE id = ?").run(ticketId);
    const t = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
    io.emit('ticket:update', t);
  }

  io.to(chatId || 'global').emit('chat:message', msg);
  res.json(msg);
});

// API: Clients (minimal)
app.get('/api/clients', (req, res) => {
  const rows = db.prepare('SELECT * FROM clients ORDER BY name').all();
  res.json(rows);
});
app.post('/api/clients', (req, res) => {
  const { name, cnpj, slaPlan } = req.body;
  const info = db.prepare('INSERT INTO clients (name, cnpj, slaPlan) VALUES (?,?,?)').run(name, cnpj, slaPlan);
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(info.lastInsertRowid);
  res.json(client);
});

// API: Devices
app.get('/api/devices', (req, res) => {
  const rows = db.prepare(`SELECT devices.*, clients.name AS clientName FROM devices LEFT JOIN clients ON devices.clientId = clients.id ORDER BY devices.name`).all();
  res.json(rows);
});
app.post('/api/devices', (req, res) => {
  const { clientId, name, serial } = req.body;
  const info = db.prepare('INSERT INTO devices (clientId, name, serial) VALUES (?,?,?)').run(clientId, name, serial);
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(info.lastInsertRowid);
  res.json(device);
});

// API: Remote sessions
app.post('/api/remote/start', (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.status(400).json({ error: 'deviceId is required' });
  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(deviceId);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  const token = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  const result = db.prepare('INSERT INTO remote_sessions (deviceId, status, sessionToken) VALUES (?,?,?)').run(deviceId, 'starting', token);
  const sessionId = result.lastInsertRowid;
  const session = db.prepare('SELECT * FROM remote_sessions WHERE id = ?').get(sessionId);

  // Simulate session negotiation before becoming active
  setTimeout(() => {
    db.prepare('UPDATE remote_sessions SET status = ? WHERE id = ?').run('active', sessionId);
  }, 1000);

  res.json(session);
});

app.get('/api/remote/status', (req, res) => {
  const deviceId = req.query.deviceId;
  if (!deviceId) return res.status(400).json({ status: 'deviceId query parameter required' });

  const session = db.prepare('SELECT * FROM remote_sessions WHERE deviceId = ? ORDER BY createdAt DESC LIMIT 1').get(deviceId);
  if (!session) return res.json({ status: 'Nenhuma sessão ativa' });

  db.prepare('UPDATE remote_sessions SET lastPing = CURRENT_TIMESTAMP WHERE id = ?').run(session.id);
  res.json({ status: session.status || 'starting', deviceId: session.deviceId, sessionToken: session.sessionToken, createdAt: session.createdAt, lastPing: new Date().toISOString() });
});

// Download project as zip
app.get('/download', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename=linkzam_project.zip');
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', err => res.status(500).send({ error: err.message }));
  archive.pipe(res);
  archive.directory(path.join(__dirname), false);
  archive.finalize();
});

// Socket.IO
io.on('connection', (socket) => {
  socket.on('chat:join', (chatId) => {
    socket.join(chatId || 'global');
  });

  socket.on('chat:message', (data) => {
    // data: { chatId, ticketId, sender, senderRole, content }
    const { chatId, ticketId, sender, senderRole, content } = data;
    const stmt = db.prepare('INSERT INTO messages (ticketId, chatId, sender, senderRole, content) VALUES (?,?,?,?,?)');
    const info = stmt.run(ticketId || null, chatId || null, sender || 'Anon', senderRole || 'user', content || '');
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);

    // If operator sent a message and ticket exists, set status
    if (senderRole === 'operator' && ticketId) {
      db.prepare("UPDATE tickets SET status = 'Aguardando Cliente' WHERE id = ?").run(ticketId);
      const t = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
      io.emit('ticket:update', t);
    }

    io.to(chatId || 'global').emit('chat:message', msg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
