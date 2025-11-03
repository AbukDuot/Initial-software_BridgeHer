import * as MentorshipModel from "../models/mentorshipModel.js";
import pool from "../config/db.js";
import { sendMentorshipNotification, sendMentorshipRequestEmail, sendMentorshipConfirmationEmail } from "../services/emailService.js";
import { sendMentorshipSMS, sendMentorshipRequestSMS, sendMentorshipConfirmationSMS } from "../services/smsService.js";

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
    console.log('Creating mentorship request...');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    const payload = {
      requester_id: req.user?.id || req.body.requester_id,
      mentor_id: req.body.mentor_id || null,
      topic: req.body.topic || "",
      message: req.body.message || "",
      status: req.body.status || "pending",
      scheduled_at: req.body.scheduled_at || null,
    };
    console.log('Payload:', payload);
    if (!payload.requester_id) return res.status(400).json({ error: "requester_id is required" });
    const created = await MentorshipModel.create(payload);
    console.log('Created:', created);
    
    if (payload.mentor_id) {
      const { rows } = await pool.query(
        "SELECT l.name as learner_name, l.email as learner_email, l.contact as learner_phone, m.name as mentor_name, m.email as mentor_email, m.contact as mentor_phone FROM users l LEFT JOIN users m ON m.id = $2 WHERE l.id = $1",
        [payload.requester_id, payload.mentor_id]
      );
      
      if (rows[0] && rows[0].mentor_email) {
      console.log("\n Sending mentorship request notifications...");
      
      
      sendMentorshipRequestEmail(
        rows[0].mentor_email,
        rows[0].mentor_name,
        rows[0].learner_name,
        payload.topic,
        payload.message
      ).catch(err => console.error("Mentor email failed:", err.message));
      
      if (rows[0].mentor_phone) {
        sendMentorshipRequestSMS(
          rows[0].mentor_phone,
          rows[0].mentor_name,
          rows[0].learner_name,
          payload.topic
        ).catch(err => console.error("Mentor SMS failed:", err.message));
      }
      
      
      sendMentorshipConfirmationEmail(
        rows[0].learner_email,
        rows[0].learner_name,
        rows[0].mentor_name,
        payload.topic
      ).catch(err => console.error("Learner email failed:", err.message));
      
      if (rows[0].learner_phone) {
        sendMentorshipConfirmationSMS(
          rows[0].learner_phone,
          rows[0].learner_name,
          rows[0].mentor_name,
          payload.topic
        ).catch(err => console.error("Learner SMS failed:", err.message));
      }
    }
    }
    
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
    
    if (fields.status === 'accepted' || fields.scheduled_at) {
      const { rows } = await pool.query(
        "SELECT l.name as learner_name, l.email as learner_email, l.contact as learner_phone, m.name as mentor_name, m.email as mentor_email, m.contact as mentor_phone, mr.scheduled_at FROM users l, users m, mentorship_requests mr WHERE mr.id = $1 AND l.id = mr.requester_id AND m.id = mr.mentor_id",
        [id]
      );
      
      if (rows[0]) {
        console.log("\n Sending mentorship notifications...");
        console.log("   Status:", fields.status || "scheduled");
        console.log("   Scheduled:", fields.scheduled_at || rows[0].scheduled_at || "Not scheduled");
        
        // Notify learner
        sendMentorshipNotification(rows[0].learner_email, rows[0].learner_name, rows[0].mentor_name).catch(err => {
          console.error(" Learner email failed:", err.message);
        });
        if (rows[0].learner_phone) {
          sendMentorshipSMS(rows[0].learner_phone, rows[0].learner_name, rows[0].mentor_name).catch(err => {
            console.error(" Learner SMS failed:", err.message);
          });
        }
        
        // Notify mentor
        sendMentorshipNotification(rows[0].mentor_email, rows[0].mentor_name, rows[0].learner_name).catch(err => {
          console.error(" Mentor email failed:", err.message);
        });
        if (rows[0].mentor_phone) {
          sendMentorshipSMS(rows[0].mentor_phone, rows[0].mentor_name, rows[0].learner_name).catch(err => {
            console.error(" Mentor SMS failed:", err.message);
          });
        }
      }
    }
    
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