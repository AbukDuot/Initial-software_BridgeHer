import * as MentorshipModel from "../models/mentorshipModel.js";

export async function listRequests(req, res, next) {
  try {
    const { mentorId, requesterId, status, limit } = req.query;
    const rows = await MentorshipModel.list({ mentorId, requesterId, status, limit: limit ? Number(limit) : undefined });
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}


export async function getRequest(req, res, next) {
  try {
    const { id } = req.params;
    const item = await MentorshipModel.getById(id);
    if (!item) return res.status(404).json({ error: "Mentorship request not found" });
    return res.json(item);
  } catch (err) {
    next(err);
  }
}


export async function createRequest(req, res, next) {
  try {
    const payload = {
      requester_id: req.user?.id || req.body.requester_id,
      mentor_id: req.body.mentor_id || null,
      topic: req.body.topic || "",
      message: req.body.message || "",
      status: req.body.status || "pending",
      scheduled_at: req.body.scheduled_at || null,
    };
    if (!payload.requester_id) return res.status(400).json({ error: "requester_id is required" });
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
    const updated = await MentorshipModel.update(id, fields);
    if (!updated) return res.status(404).json({ error: "Mentorship request not found" });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}


export async function deleteRequest(req, res, next) {
  try {
    const { id } = req.params;
    const ok = await MentorshipModel.remove(id);
    if (!ok) return res.status(404).json({ error: "Mentorship request not found" });
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
}


export async function mentorSummary(req, res, next) {
  try {
    const { mentorId } = req.params;
    const rows = await MentorshipModel.summaryForMentor(mentorId);
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}