let ioInstance = null;

export function setSocketServer(io) {
  ioInstance = io;
}

export function emit(event, payload, room = null) {
  if (!ioInstance) return;
  if (room) {
    ioInstance.to(room).emit(event, payload);
    return;
  }
  ioInstance.emit(event, payload);
}
