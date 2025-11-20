import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import pool from "../config/db.js";
import { protect } from "../middleware/authMiddleware.js";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});


const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, phone, bio, location, profile_pic FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/", protect, async (req, res) => {
  const { name, email, phone, bio, location } = req.body;
  try {
    console.log('Updating profile for user:', req.user.id, req.body);
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined && name !== null && name !== '') {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (email !== undefined && email !== null && email !== '') {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone !== undefined && phone !== null) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (bio !== undefined && bio !== null) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }
    if (location !== undefined && location !== null) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    values.push(req.user.id);
    
    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')}
       WHERE id = $${paramCount} RETURNING id, name, email, role, phone, bio, location, profile_pic`,
      values
    );
    console.log('Profile updated successfully:', rows[0]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


router.post("/upload-image", protect, upload.single('image'), async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      userId: req.user?.id,
      fileSize: req.file?.size
    });

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ error: "Cloudinary not configured" });
    }

  
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "bridgeher/profiles",
          transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    
    const { rows } = await pool.query(
      "UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING id, name, email, role, profile_pic",
      [result.secure_url, req.user.id]
    );

    console.log('Database update success:', rows[0]);

    res.json({ 
      message: "Profile image updated successfully", 
      imageUrl: result.secure_url,
      user: rows[0]
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      error: "Failed to upload image", 
      message: error.message,
      details: error.toString()
    });
  }
});

export default router;
