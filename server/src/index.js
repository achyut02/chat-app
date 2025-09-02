require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 4000;

(async ()=>{
  await connectDB(process.env.MONGO_URI);

  const onlineUsers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('auth error'));
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      next();
    } catch (err) {
      next(new Error('auth error'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId.toString(), socket.id);
    console.log('user connected', userId);
    await User.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() });
    io.emit('user:online', { userId });

    socket.on('typing:start', ({ conversationId }) => {
      Conversation.findById(conversationId).then(conv => {
        if(!conv) return;
        conv.participants.forEach(p => {
          if (p.toString() !== userId.toString()) {
            const sid = onlineUsers.get(p.toString());
            if (sid) io.to(sid).emit('typing:start', { conversationId, userId });
          }
        });
      });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      Conversation.findById(conversationId).then(conv => {
        if(!conv) return;
        conv.participants.forEach(p => {
          if (p.toString() !== userId.toString()) {
            const sid = onlineUsers.get(p.toString());
            if (sid) io.to(sid).emit('typing:stop', { conversationId, userId });
          }
        });
      });
    });

    socket.on('message:send', async ({ conversationId, toUserId, text }) => {
      let conv = conversationId ? await Conversation.findById(conversationId) :
        await Conversation.findOne({ participants: { $all: [userId, toUserId] } });
      if (!conv) {
        conv = await Conversation.create({ participants: [userId, toUserId] });
      }
      const msg = await Message.create({ conversation: conv._id, sender: userId, text, createdAt: new Date() });
      conv.lastMessage = msg._id;
      await conv.save();
      const populated = await msg.populate('sender', 'name');

      conv.participants.forEach(p => {
        const sid = onlineUsers.get(p.toString());
        if (sid) io.to(sid).emit('message:new', { message: populated, conversationId: conv._id.toString() });
      });
    });

    socket.on('message:read', async ({ conversationId, messageId }) => {
      const msg = await Message.findById(messageId);
      if (!msg) return;
      if (!msg.readBy.includes(userId)) {
        msg.readBy.push(userId);
        await msg.save();
      }
      const senderId = msg.sender.toString();
      const sid = onlineUsers.get(senderId);
      if (sid) io.to(sid).emit('message:read', { messageId, readerId: userId });
    });

    socket.on('disconnect', async () => {
      console.log('disconnect', userId);
      onlineUsers.delete(userId.toString());
      await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
      io.emit('user:offline', { userId });
    });
  });

  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();
