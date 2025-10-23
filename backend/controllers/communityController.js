import * as CommunityModel from "../models/communityModel.js";
import fs from "fs";
import path from "path";


export async function listPosts(req, res, next) {
  try {
    const { q, limit, offset } = req.query;
    const rows = await CommunityModel.listPosts({ q, limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : 0 });
    return res.json(rows);
  } catch (err) {
    next(err);
  }
}


export async function getPost(req, res, next) {
  try {
    const { id } = req.params;
    const post = await CommunityModel.getPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const comments = await CommunityModel.listComments(id);
    return res.json({ ...post, comments });
  } catch (err) {
    next(err);
  }
}


export async function createPost(req, res, next) {
  try {
    const userId = req.user?.id || req.body.user_id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || "");
    const payload = { user_id: userId, content: req.body.content || "", image };
    const created = await CommunityModel.createPost(payload);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}


export async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const fields = {};
    if (req.body.content !== undefined) fields.content = req.body.content;
    if (req.file) fields.image = `/uploads/${req.file.filename}`;
    if (!Object.keys(fields).length) return res.status(400).json({ error: "No updatable fields provided" });
    const updated = await CommunityModel.updatePost(id, fields);
    if (!updated) return res.status(404).json({ error: "Post not found" });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}


export async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const post = await CommunityModel.getPostById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.image) {
      const filePath = path.join(process.cwd(), post.image);
      fs.unlink(filePath, () => {});
    }
    const ok = await CommunityModel.removePost(id);
    return res.json({ success: ok });
  } catch (err) {
    next(err);
  }
}


export async function addComment(req, res, next) {
  try {
    const postId = req.params.id;
    const userId = req.user?.id || req.body.user_id;
    if (!userId) return res.status(401).json({ error: "Authentication required" });
    if (!req.body.content) return res.status(400).json({ error: "content is required" });
    const created = await CommunityModel.addComment(postId, { user_id: userId, content: req.body.content });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const ok = await CommunityModel.removeComment(commentId);
    return res.json({ success: ok });
  } catch (err) {
    next(err);
  }
}