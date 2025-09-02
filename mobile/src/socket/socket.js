import { io } from 'socket.io-client';
let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;
  socket = io('http://192.168.0.110:4000', {
    auth: { token },
    transports: ['websocket']
  });
  return socket;
};

export const getSocket = () => socket;
