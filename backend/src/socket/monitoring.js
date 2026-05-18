const prisma = require("../config/db");

function setupMonitoring(io, socket) {
  socket.on("flag:report", async ({ sessionId, flagType, metadata }) => {
    try {
      const session = await prisma.examSession.findUnique({
        where: { id: sessionId },
      });
      if (!session) return;

      const flag = await prisma.behavioralFlag.create({
        data: {
          sessionId,
          studentId: session.studentId,
          flagType,
          metadata,
        },
      });

      io.to(`exam:${session.examId}`).emit("flag:new", {
        sessionId,
        studentId: session.studentId,
        flagType,
        metadata,
        createdAt: flag.createdAt,
      });
    } catch (err) {
      console.error("Flag report error:", err.message);
    }
  });

  socket.on("join:monitor", ({ examId }) => {
    socket.join(`exam:${examId}`);
  });
}

module.exports = { setupMonitoring };
