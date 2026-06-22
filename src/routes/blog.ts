import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { handleError } from '../utils/errors';
import { generateSlug } from '../utils/slug';

const router = express.Router();

// Get all blogs (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'published' } = req.query;
    // Clamp pagination to safe bounds to avoid unbounded/invalid queries.
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (status !== 'all') {
      whereClause.published = status === 'published';
    }

    const blogs = await prisma.blogPost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limitNum,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const total = await prisma.blogPost.count({
      where: whereClause
    });

    res.json({
      blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    handleError(res, error, 'Get blogs error:');
  }
});

// Get blog by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blogPost.findFirst({
      where: {
        slug: slug,
        published: true
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    handleError(res, error, 'Get blog by slug error:');
  }
});

// Get blog by ID (admin)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);

    if (isNaN(blogId)) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }

    const blog = await prisma.blogPost.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    handleError(res, error, 'Get blog by ID error:');
  }
});

// Create blog (admin)
router.post('/', authenticateToken, [
  body('title').isLength({ min: 1, max: 300 }).withMessage('Title is required and must be less than 300 characters'),
  body('content').isLength({ min: 1 }).withMessage('Content is required'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
  body('published').optional().isBoolean().withMessage('Published must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, excerpt, published = false, tags = [], featuredImage } = req.body;
    const slug = generateSlug(title);

    // Check if slug already exists
    const existingBlog = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existingBlog) {
      return res.status(400).json({ error: 'A blog with this title already exists' });
    }

    const publishedAt = published ? new Date() : null;

    const blog = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.substring(0, 200) + '...',
        featuredImage,
        published,
        publishedAt,
        tags,
        // Attribute the post to the authenticated user, not an arbitrary admin.
        authorId: req.user.userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({ 
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    handleError(res, error, 'Create blog error:');
  }
});

// Update blog (admin)
router.put('/:id', authenticateToken, [
  body('title').optional().isLength({ min: 1, max: 300 }).withMessage('Title must be less than 300 characters'),
  body('content').optional().isLength({ min: 1 }).withMessage('Content cannot be empty'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('Excerpt must be less than 500 characters'),
  body('published').optional().isBoolean().withMessage('Published must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const blogId = parseInt(req.params.id);

    if (isNaN(blogId)) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }

    const { title, content, excerpt, published, tags, featuredImage } = req.body;

    // Check if blog exists
    const existingBlog = await prisma.blogPost.findUnique({
      where: { id: blogId }
    });

    if (!existingBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const updateData: any = {};

    if (title) {
      const slug = generateSlug(title);
      // Check if new slug conflicts with existing blogs
      const slugConflict = await prisma.blogPost.findFirst({
        where: {
          slug: slug,
          id: { not: blogId }
        }
      });

      if (slugConflict) {
        return res.status(400).json({ error: 'A blog with this title already exists' });
      }

      updateData.title = title;
      updateData.slug = slug;
    }

    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (tags) updateData.tags = tags;

    if (published !== undefined) {
      updateData.published = published;
      // Set publishedAt if status changed to published
      if (published && !existingBlog.published) {
        updateData.publishedAt = new Date();
      }
    }

    const blog = await prisma.blogPost.update({
      where: { id: blogId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    handleError(res, error, 'Update blog error:');
  }
});

// Delete blog (admin)
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const blogId = parseInt(req.params.id);

    if (isNaN(blogId)) {
      return res.status(400).json({ error: 'Invalid blog ID' });
    }

    await prisma.blogPost.delete({
      where: { id: blogId }
    });

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete blog error:');
  }
});

export default router;
