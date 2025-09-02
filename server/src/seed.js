require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async ()=>{
  await connectDB(process.env.MONGO_URI);
  await User.deleteMany({});
  const users = [
    { name: 'Alice', email: 'alice@example.com', password: 'password' },
    { name: 'Bob', email: 'bob@example.com', password: 'password' },
    { name: 'Charlie', email: 'charlie@example.com', password: 'password' },
  ];
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.create({ name: u.name, email: u.email, passwordHash });
  }
  console.log('seeded');
  process.exit(0);
})();
