# Community Forum Update Instructions

## Database Migration Required

You need to run the SQL migration to add media support to the community forum.

### Step 1: Connect to Your Production Database

Go to your Render dashboard → PostgreSQL database → Connect tab

Copy the External Database URL or use the Render Shell.

### Step 2: Run the Migration

Execute the SQL file located at: `backend/migrations/fix_community_schema.sql`

```sql
-- Fix community_topics table schema
-- Add description column if it doesn't exist
ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS description TEXT;

-- Add media support columns
ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE community_topics ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) CHECK (media_type IN ('none', 'image', 'video'));

-- Add media support to replies
ALTER TABLE topic_replies ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE topic_replies ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE topic_replies ADD COLUMN IF NOT EXISTS media_type VARCHAR(20) CHECK (media_type IN ('none', 'image', 'video'));

-- Set default media_type
UPDATE community_topics SET media_type = 'none' WHERE media_type IS NULL;
UPDATE topic_replies SET media_type = 'none' WHERE media_type IS NULL;
```

### Step 3: Verify the Changes

After running the migration, verify that the columns were added:

```sql
\d community_topics
\d topic_replies
```

You should see the new columns: `description`, `image_url`, `video_url`, and `media_type`.

## What's New in Community Forum

✅ **Fixed**: "description column does not exist" error when creating topics
✅ **New**: Users can now upload images to their topics
✅ **New**: Users can now upload videos to their topics
✅ **New**: Images and videos are displayed in topic detail pages
✅ **New**: Media preview before posting
✅ **Improved**: Professional community forum with rich media support

## Features Added

1. **Image Upload**: Users can attach images to their community posts
2. **Video Upload**: Users can attach videos to their community posts
3. **Media Preview**: See preview of uploaded media before posting
4. **Media Display**: Images and videos are beautifully displayed in topic pages
5. **Remove Media**: Option to remove uploaded media before posting

## How Users Can Use It

1. Go to Community Forum
2. Click "New Topic"
3. Fill in title, category, and description
4. Click "Add Image or Video" to upload media (optional)
5. Preview the media
6. Add tags
7. Click "Post Topic"

## Technical Details

- Images are uploaded to Cloudinary
- Videos are uploaded to Cloudinary
- Media URLs are stored in the database
- Media type is tracked (none/image/video)
- Frontend displays media based on type

## Next Steps

After running the migration:
1. Test creating a new topic with an image
2. Test creating a new topic with a video
3. Verify media displays correctly in topic detail page
4. Check that existing topics still work

## Troubleshooting

If you get errors:
- Make sure you're connected to the production database
- Check that the migration SQL ran successfully
- Verify Cloudinary credentials are set in backend environment variables
- Check backend logs for any upload errors
