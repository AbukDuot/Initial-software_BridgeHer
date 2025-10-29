# Cloudinary Setup Guide for BridgeHer

## Step 1: Create Cloudinary Account (FREE)

1. Go to: https://cloudinary.com/users/register_free
2. Sign up with email
3. Verify your email
4. Login to dashboard

## Step 2: Get Your Credentials

1. Go to Dashboard: https://console.cloudinary.com/
2. You'll see:
   - **Cloud Name**: (e.g., `dxxxxx`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (click "Show" to reveal)

## Step 3: Add Credentials to .env

Open `backend/.env` and replace:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

With your actual credentials from Step 2.

## Step 4: Update modules.js to Use Cloudinary

Replace the multer storage in `backend/routes/modules.js`:

```javascript
// At the top, add:
import { storage as cloudinaryStorage } from "../config/cloudinary.js";

// Replace the fileUpload definition with:
const fileUpload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB (Cloudinary free limit)
});
```

## Step 5: Restart Backend

```bash
cd backend
npm run dev
```

## What You Get (FREE Tier):

✅ **25GB Storage** - ~50 hours of video (at 500MB/hour)
✅ **25GB Bandwidth/month** - ~500 video views/month
✅ **Automatic optimization** - Videos compressed automatically
✅ **Fast CDN delivery** - Global fast streaming
✅ **No server storage needed** - Videos stored in cloud
✅ **Secure URLs** - Protected video links

## How It Works:

1. Admin uploads video through form
2. Video goes directly to Cloudinary
3. Cloudinary returns secure URL
4. URL saved to database
5. Learners stream from Cloudinary CDN

## Video URLs Format:

Cloudinary URLs look like:
```
https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1234567890/bridgeher-videos/video-name.mp4
```

Your CoursePlayer already supports these URLs!

## Monitoring Usage:

- Dashboard: https://console.cloudinary.com/
- Check storage and bandwidth usage
- Get alerts when approaching limits

## Upgrade Options (if needed later):

- **Plus**: $89/month - 100GB storage, 100GB bandwidth
- **Advanced**: $224/month - 250GB storage, 250GB bandwidth

## Alternative: Keep Local + Cloudinary

You can use BOTH:
- Small videos (< 50MB): Local storage (current system)
- Large videos (> 50MB): Cloudinary

Your system already supports both!
