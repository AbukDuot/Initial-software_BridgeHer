import express from 'express';
import pool from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup Computer courses with modules and videos
router.post('/setup-computer-courses', requireAuth, requireRole(['Admin']), async (req, res) => {
  try {
    // Find both computer courses
    const { rows: courseRows } = await pool.query(
      `SELECT id, title FROM courses WHERE title ILIKE '%Introduction to Computer%' OR title ILIKE '%Introduction to Technology%'`
    );
    
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Computer courses not found' });
    }
    
    let setupResults = [];
    
    for (const course of courseRows) {
      const courseId = course.id;
      const courseTitle = course.title;
      
      // Delete existing modules
      await pool.query('DELETE FROM modules WHERE course_id = $1', [courseId]);
    
      // Define modules based on course type
      let modules = [];
      
      if (courseTitle.toLowerCase().includes('computer')) {
        modules = [
          {
            title: 'Computer Hardware Basics',
            description: 'Learn about computer components and how they work together.',
            content: 'Understanding CPU, RAM, storage, motherboard, and other essential computer components.',
            video_url: 'https://www.youtube.com/embed/8Z3Y0sU1y1M',
            duration: 20,
            order_index: 1
          },
          {
            title: 'Operating System Fundamentals',
            description: 'Master Windows interface and file management.',
            content: 'Navigate Windows, manage files and folders, understand system settings.',
            video_url: 'https://www.youtube.com/embed/1T_YbkBWGcE',
            duration: 25,
            order_index: 2
          },
          {
            title: 'Basic Computer Operations',
            description: 'Essential computer skills for everyday use.',
            content: 'Learn typing, mouse usage, keyboard shortcuts, and basic troubleshooting.',
            video_url: 'https://www.youtube.com/embed/kFMTec22JfQ',
            duration: 18,
            order_index: 3
          }
        ];
      } else {
        modules = [
      {
        title: 'Computer Basics and Hardware',
        description: 'Learn about computer components, hardware, and basic operations.',
        content: 'This module covers the fundamental components of a computer system, including hardware components like CPU, RAM, storage devices, and input/output devices. You will learn how computers work and basic troubleshooting.',
        video_url: 'https://www.youtube.com/embed/8Z3Y0sU1y1M',
        duration: 20,
        order_index: 1
      },
      {
        title: 'Understanding Operating Systems',
        description: 'Introduction to Windows, file management, and system navigation.',
        content: 'Learn about operating systems, focusing on Windows interface, file and folder management, system settings, and basic maintenance tasks. This module will help you navigate your computer confidently.',
        video_url: 'https://www.youtube.com/embed/1T_YbkBWGcE',
        duration: 25,
        order_index: 2
      },
      {
        title: 'Internet and Web Browsing',
        description: 'Master internet navigation, web browsers, and online search techniques.',
        content: 'Discover how to use web browsers effectively, perform online searches, understand URLs, bookmarks, and browse the internet safely. Learn about different browsers and their features.',
        video_url: 'https://www.youtube.com/embed/YuZP1JmRzjI',
        duration: 18,
        order_index: 3
      },
      {
        title: 'Email and Digital Communication',
        description: 'Learn to send emails, manage contacts, and communicate digitally.',
        content: 'Master email basics including creating accounts, composing messages, managing contacts, organizing emails with folders, and understanding email etiquette for professional communication.',
        video_url: 'https://www.youtube.com/embed/GtQdIYUtAHg',
        duration: 22,
        order_index: 4
      },
      {
        title: 'Online Safety and Security',
        description: 'Protect yourself online with essential cybersecurity knowledge.',
        content: 'Learn about password security, recognizing scams, protecting personal information, safe browsing habits, and understanding privacy settings on various platforms.',
        video_url: 'https://www.youtube.com/embed/UB1O30fR-EE',
        duration: 20,
        order_index: 5
      },
      {
        title: 'Social Media and Digital Platforms',
        description: 'Navigate social media platforms safely and effectively.',
        content: 'Understand popular social media platforms, privacy settings, professional networking, and how to use social media for personal and business purposes while maintaining safety.',
        video_url: 'https://www.youtube.com/embed/2QR3dvs5Mps',
        duration: 25,
        order_index: 6
      },
      {
        title: 'Essential Digital Tools and Applications',
        description: 'Explore useful software and applications for productivity.',
        content: 'Learn about essential software applications including word processors, spreadsheets, presentation tools, and mobile apps that can enhance your productivity and digital skills.',
        video_url: 'https://www.youtube.com/embed/kFMTec22JfQ',
        duration: 30,
        order_index: 7
      }
        ];
      }
      
      // Insert all modules
      for (const module of modules) {
        await pool.query(
          `INSERT INTO modules (course_id, title, description, content, video_url, duration, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [courseId, module.title, module.description, module.content, module.video_url, module.duration, module.order_index]
        );
      }
    
      // Update course with preview and additional info
      const previewUrl = courseTitle.toLowerCase().includes('computer') 
        ? 'https://www.youtube.com/embed/8Z3Y0sU1y1M'
        : 'https://www.youtube.com/embed/kFMTec22JfQ';
        
      const estimatedHours = courseTitle.toLowerCase().includes('computer') ? 8 : 12;
      
      await pool.query(
        `UPDATE courses SET 
          preview_video_url = $1,
          estimated_hours = $2,
          prerequisites = $3,
          learning_objectives = $4
         WHERE id = $5`,
        [
          previewUrl,
          estimatedHours,
          courseTitle.toLowerCase().includes('computer') 
            ? 'No computer experience required'
            : 'Basic familiarity with smartphones or computers helpful',
          courseTitle.toLowerCase().includes('computer')
            ? 'Learn computer basics, hardware understanding, and essential operations'
            : 'Understand modern technology, digital communication, and productivity tools',
          courseId
        ]
      );
      
      setupResults.push({
        courseTitle,
        courseId,
        modulesAdded: modules.length
      });
    }
    
    res.json({
      message: 'Computer courses setup completed successfully',
      courses: setupResults
    });
    
  } catch (error) {
    console.error('Setup technology course error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;