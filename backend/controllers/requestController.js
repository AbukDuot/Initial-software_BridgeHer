import * as MentorshipModel from "../models/mentorshipModel.js";
import pool from "../config/db.js";

export async function listRequests(req, res, next) {
  try {
    const { mentorId, requesterId, status, limit } = req.query;
    const rows = await MentorshipModel.list({
      mentorId: mentorId || undefined,
      requesterId: requesterId || undefined,
      status: status || undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getRequest(req, res, next) {
  try {
    const { id } = req.params;
    const item = await MentorshipModel.getById(id);
    if (!item) return res.status(404).json({ error: "Request not found" });
    return res.json(item);
  } catch (err) {
    next(err);
  }
}


export async function createRequest(req, res, next) {
  try {
    const requester_id = req.user?.id || req.body.requester_id;
    if (!requester_id) return res.status(401).json({ error: "Authentication required" });

    const payload = {
      requester_id,
      mentor_id: req.body.mentor_id || null,
      topic: req.body.topic || "",
      message: req.body.message || "",
      status: req.body.status || "pending",
      scheduled_at: req.body.scheduled_at || null,
    };

    const created = await MentorshipModel.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}


export async function updateRequest(req, res, next) {
  try {
    const { id } = req.params;
    const allowed = ["mentor_id", "topic", "message", "status", "scheduled_at"];
    const fields = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) fields[k] = req.body[k];
    }
    if (!Object.keys(fields).length) return res.status(400).json({ error: "No updatable fields provided" });


    const existing = await MentorshipModel.getById(id);
    if (!existing) return res.status(404).json({ error: "Request not found" });

    if (req.user) {
      const uid = String(req.user.id);
      const isRequester = String(existing.requester_id) === uid;
      const isAssignedMentor = existing.mentor_id ? String(existing.mentor_id) === uid : false;
      const isAdmin = req.user.role === "Admin";
      if (!isRequester && !isAssignedMentor && !isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    const updated = await MentorshipModel.update(id, fields);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}


export async function deleteRequest(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await MentorshipModel.getById(id);
    if (!existing) return res.status(404).json({ error: "Request not found" });


    if (req.user) {
      const uid = String(req.user.id);
      const isRequester = String(existing.requester_id) === uid;
      const isAdmin = req.user.role === "Admin";
      if (!isRequester && !isAdmin) return res.status(403).json({ error: "Forbidden" });
    } else {
      return res.status(401).json({ error: "Authentication required" });
    }

    const ok = await MentorshipModel.remove(id);
    return res.json({ success: ok });
  } catch (err) {
    next(err);
  }
}

export async function respondToRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { action, scheduled_at } = req.body;
    if (!["accept", "decline"].includes(action)) return res.status(400).json({ error: "Invalid action" });

    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const responderId = req.user.id;
    const isAdmin = req.user.role === "Admin";

    const existing = await MentorshipModel.getById(id);
    if (!existing) return res.status(404).json({ error: "Request not found" });

    const isAssignedMentor = existing.mentor_id ? String(existing.mentor_id) === String(responderId) : false;
    if (existing.mentor_id && !isAssignedMentor && !isAdmin) {
      return res.status(403).json({ error: "Forbidden - not assigned mentor" });
    }

    const newStatus = action === "accept" ? "accepted" : "declined";
    const fields = { status: newStatus };
    if (action === "accept" && !existing.mentor_id) fields.mentor_id = responderId;
    if (scheduled_at) fields.scheduled_at = scheduled_at;

    const updated = await MentorshipModel.update(id, fields);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}