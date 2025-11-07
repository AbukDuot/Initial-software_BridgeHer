import * as CourseModel from "../models/courseModel.js";
import pool from "../config/db.js";
import fs from "fs";
import path from "path";


async function modelList(opts) {
  if (CourseModel.list) return CourseModel.list(opts);
 
  const { q, category } = opts || {};
  const where = [];
  const params = [];
  if (category && category !== "All") {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }
  params.push(200);
  const sql = `SELECT * FROM courses ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT $${params.length}`;
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function modelGetById(id) {
  if (CourseModel.getById) return CourseModel.getById(id);
  const { rows } = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
  return rows[0] || null;
}

async function modelCreate(payload) {
  if (CourseModel.create) return CourseModel.create(payload);
  const { title, description = "", category = "General", mentor = "", level = "Beginner", duration = "", image = "" } = payload;
  const sql = `INSERT INTO courses (title, description, category, mentor, level, duration, image)
               VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const params = [title, description, category, mentor, level, duration, image];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

async function modelUpdate(id, fields) {
  if (CourseModel.update) return CourseModel.update(id, fields);
  const keys = Object.keys(fields);
  if (!keys.length) return null;
  const sets = keys.map((k, i) => `${k} = $${i + 1}`);
  const params = keys.map((k) => fields[k]);
  params.push(id);
  const sql = `UPDATE courses SET ${sets.join(", ")}, updated_at = now() WHERE id = $${params.length} RETURNING *`;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

async function modelRemove(id) {
  if (CourseModel.remove) return CourseModel.remove(id);
  const { rowCount } = await pool.query("DELETE FROM courses WHERE id = $1", [id]);
  return rowCount > 0;
}


export async function listCourses(req, res, next) {
  try {
    const { q, category } = req.query;
    const rows = await modelList({ q, category });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getCourseRecommendations(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT c.*, cr.similarity_score 
       FROM course_recommendations cr
       JOIN courses c ON c.id = cr.recommended_course_id
       WHERE cr.course_id = $1
       ORDER BY cr.similarity_score DESC
       LIMIT 4`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getCoursePreview(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, title, description, preview_video_url, syllabus, 
              estimated_hours, prerequisites, learning_objectives,
              average_rating, total_reviews, instructor_id
       FROM courses WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Course not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}


export async function getCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await modelGetById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json(course);
  } catch (err) {
    next(err);
  }
}


export async function createCourse(req, res, next) {
  try {
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "");
    const payload = { ...req.body, image };
    if (!payload.title) return res.status(400).json({ error: "title is required" });
    const created = await modelCreate(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}


export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const fields = { ...req.body };
    if (req.file) fields.image = `/uploads/${req.file.filename}`;

    const updated = await modelUpdate(id, fields);
    if (!updated) return res.status(404).json({ error: "Course not found or no fields to update" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}


export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await modelGetById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    
    if (course.image) {
      const filePath = path.join(process.cwd(), course.image);
      fs.unlink(filePath, () => {});
    }

    const ok = await modelRemove(id);
    res.json({ success: ok });
  } catch (err) {
    next(err);
  }
}