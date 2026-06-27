import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';

let ioServer: IOServer | null = null;

export function initializeSocketServer(server: HTTPServer): IOServer {
  ioServer = new IOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioServer.on('connection', (socket) => {
    socket.on('submission-created', (payload) => {
      socket.broadcast.emit('submission-created', payload);
    });

    socket.on('compilation-started', (payload) => {
      socket.broadcast.emit('compilation-started', payload);
    });

    socket.on('compilation-finished', (payload) => {
      socket.broadcast.emit('compilation-finished', payload);
    });

    socket.on('execution-started', (payload) => {
      socket.broadcast.emit('execution-started', payload);
    });

    socket.on('execution-finished', (payload) => {
      socket.broadcast.emit('execution-finished', payload);
    });

    socket.on('submission-completed', (payload) => {
      socket.broadcast.emit('submission-completed', payload);
    });
  });

  return ioServer;
}

export function getSocketServer(): IOServer | null {
  return ioServer;
}
