const axios = require("axios");
const prisma = require("../../config/db");
const { mlServiceUrl } = require("../../config/env");
const { AppError } = require("../../middleware/errorHandler");

const mlClient = axios.create({ baseURL: mlServiceUrl, timeout: 60000 });

async function predictVenue(req, res, next) {
  try {
    const { venueId, examId } = req.body;

    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        seatingAssignments: {
          include: {
            session: {
              include: {
                student: true,
                behavioralFlags: true,
              },
            },
          },
        },
      },
    });
    if (!venue) throw new AppError("Venue not found", 404);

    const students = venue.seatingAssignments.map((sa) => {
      const flags = sa.session.behavioralFlags;
      const countFlag = (type) => flags.filter((f) => f.flagType === type).length;

      return {
        student_id: sa.session.studentId,
        seat_x: sa.seatX,
        seat_y: sa.seatY,
        tab_switch_count: countFlag("TAB_SWITCH"),
        paste_event_count: countFlag("PASTE_EVENT"),
        window_blur_count: countFlag("WINDOW_BLUR"),
        usb_detected: countFlag("USB_DETECTED") > 0,
        multi_device_login: countFlag("MULTI_DEVICE") > 0,
        avg_answer_similarity: 0,
        time_per_question_std: 0,
        response_time_pattern: 0,
        ip_similarity_score: 0,
      };
    });

    const mlResponse = await mlClient.post("/predict", {
      venue_id: venueId,
      exam_id: examId,
      students,
    });

    const predictions = mlResponse.data.predictions || [];
    await prisma.$transaction(
      predictions.map((p) =>
        prisma.integrityPrediction.create({
          data: {
            examId,
            venueId,
            studentId: p.student_id,
            modelUsed: mlResponse.data.model_used,
            prediction: p.prediction,
            confidence: p.flagged_prob,
          },
        })
      )
    );

    res.json({ success: true, data: mlResponse.data });
  } catch (err) {
    if (err.response) {
      return next(new AppError(`ML service error: ${err.response.data.detail || err.message}`, 502));
    }
    next(err);
  }
}

async function getModels(_req, res, next) {
  try {
    const response = await mlClient.get("/models/");
    res.json({ success: true, data: response.data });
  } catch (err) {
    next(new AppError("ML service unavailable", 502));
  }
}

async function switchModel(req, res, next) {
  try {
    const { model } = req.body;
    const response = await mlClient.post("/models/switch", { model });
    res.json({ success: true, data: response.data });
  } catch (err) {
    if (err.response) {
      return next(new AppError(err.response.data.detail || "Switch failed", 400));
    }
    next(new AppError("ML service unavailable", 502));
  }
}

async function evaluateModel(req, res, next) {
  try {
    const { modelName } = req.params;
    const response = await mlClient.get(`/evaluate/${modelName}`, { params: req.query });
    res.json({ success: true, data: response.data });
  } catch (err) {
    if (err.response) {
      return next(new AppError(err.response.data.detail || "Evaluation failed", err.response.status));
    }
    next(new AppError("ML service unavailable", 502));
  }
}

async function evaluateAll(req, res, next) {
  try {
    const response = await mlClient.get("/evaluate/all", { params: req.query });
    res.json({ success: true, data: response.data });
  } catch (err) {
    next(new AppError("ML service unavailable", 502));
  }
}

async function getPredictions(req, res, next) {
  try {
    const where = {};
    if (req.query.examId) where.examId = req.query.examId;
    if (req.query.venueId) where.venueId = req.query.venueId;

    const predictions = await prisma.integrityPrediction.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: predictions });
  } catch (err) {
    next(err);
  }
}

module.exports = { predictVenue, getModels, switchModel, evaluateModel, evaluateAll, getPredictions };
