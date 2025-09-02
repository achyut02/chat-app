const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/:id/messages', async (req, res) => {
  const convId = req.params.id;
  const messages = await Message.find({ conversation: convId }).sort({ createdAt: 1 }).populate('sender', 'name');
  res.json(messages);
});

module.exports = router;
