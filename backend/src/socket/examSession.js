const redis = require("../config/redis");

const AUTOSAVE_PREFIX = "autosave:";
const AUTOSAVE_TTL = 60 * 60 * 4;

function setupExamSession(io, socket) {
  socket.on("join:exam", ({ sessionId, examId }) => {
    socket.join(`exam:${examId}`);
    socket.join(`session:${sessionId}`);
    socket.data.sessionId = sessionId;
    socket.data.examId = examId;

    io.to(`exam:${examId}`).emit("student:joined", {
      sessionId,
      socketId: socket.id,
    });
  });

  socket.on("answer:save", async ({ sessionId, answers }) => {
    try {
      await redis.setex(
        `${AUTOSAVE_PREFIX}${sessionId}`,
        AUTOSAVE_TTL,
        JSON.stringify(answers),
      );
      socket.emit("answer:saved", { success: true });
    } catch {
      socket.emit("answer:saved", { success: false });
    }
  });

  socket.on("exam:submit", ({ sessionId }) => {
    const examId = socket.data.examId;
    if (examId) {
      io.to(`exam:${examId}`).emit("student:submitted", { sessionId });
    }
  });

  socket.on("disconnect", () => {
    const { examId, sessionId } = socket.data;
    if (examId && sessionId) {
      io.to(`exam:${examId}`).emit("student:disconnected", { sessionId });
    }
  });
}

module.exports = { setupExamSession };
