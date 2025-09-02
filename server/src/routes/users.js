const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation');

router.get('/', async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select('-passwordHash');
  const result = await Promise.all(users.map(async user => {
    const conv = await Conversation.findOne({ participants: { $all: [req.user._id, user._id] } })
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'name' } });
    return { user, conversation: conv };
  }));
  res.json(result);
});

module.exports = router;
