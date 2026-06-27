import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
const socket = io(socketUrl, {
  transports: ['websocket'],
  autoConnect: true,
});

export function onSocketEvent(event, callback) {
  socket.on(event, callback);
}

export function offSocketEvent(event, callback) {
  socket.off(event, callback);
}

export function emitSocketEvent(event, payload) {
  socket.emit(event, payload);
}

export default socket;
