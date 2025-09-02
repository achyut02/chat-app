const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const convRoutes = require('./routes/conversations');
const authMiddleware = require('./middleware/auth');

app.use('/auth', authRoutes);
app.use('/users', authMiddleware, usersRoutes);
app.use('/conversations', authMiddleware, convRoutes);

app.get('/', (req,res)=> res.send('Chat server'));

module.exports = app;
