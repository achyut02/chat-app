Chat App (React Native + Node.js + Socket.IO) — MVP

Structure:
- server/  : Node.js + Express + Socket.IO + Mongoose
- mobile/  : Expo React Native client

Server:
- cd server
- npm install
- copy .env.example to .env and set MONGO_URI and JWT_SECRET
- npm run seed
- npm run dev

Mobile:
- cd mobile
- npm install
- replace '10.0.2.2' in mobile/src/api/api.js and mobile/src/socket/socket.js with your server IP if using a real device
- expo start

Sample users (seed):
- alice@example.com / password
- bob@example.com / password
- charlie@example.com / password
