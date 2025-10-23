import * as CourseModel from "../models/courseModel.js";
import fs from "fs";
import path from "path";


export async function listCourses(req, res, next) {
  try {
    const { q, category } = req.query;
    const rows = await CourseModel.list({ q, category });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}


export async function getCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await CourseModel.getById(id);
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
    const created = await CourseModel.create(payload);
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

    const updated = await CourseModel.update(id, fields);
    if (!updated) return res.status(404).json({ error: "Course not found or no fields to update" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}


export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const course = await CourseModel.getById(id);
    if (!course) return res.status(404).json({ error: "Course not found" });

   
    if (course.image) {
      const filePath = path.join(process.cwd(), course.image);
      fs.unlink(filePath, () => {});
    }

    const ok = await CourseModel.remove(id);
    res.json({ success: ok });
  } catch (err) {
    next(err);
  }
}