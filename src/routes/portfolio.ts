import express from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../config/database';
import { authenticateToken, requireRole } from '../middleware/auth';
import { handleError } from '../utils/errors';

const router = express.Router();

// Get all skills (public)
router.get('/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { level: 'desc' }
      ]
    });
    res.json(skills);
  } catch (error) {
    handleError(res, error, 'Get skills error:');
  }
});

// Get all projects (public)
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    handleError(res, error, 'Get projects error:');
  }
});

// Get single project by ID (public) — used by the project details page.
router.get('/projects/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    handleError(res, error, 'Get project error:');
  }
});

// Get all services (public)
router.get('/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(services);
  } catch (error) {
    handleError(res, error, 'Get services error:');
  }
});

// Get single service by ID (public)
router.get('/services/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    
    if (isNaN(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    handleError(res, error, 'Get service error:');
  }
});

// Admin routes for services management
// Get all services (admin)
router.get('/admin/services', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(services);
  } catch (error) {
    handleError(res, error, 'Get admin services error:');
  }
});

// Create new service (admin)
router.post('/admin/services', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { title, description, icon, features, price, duration, featured, order } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (features !== undefined && !Array.isArray(features)) {
      return res.status(400).json({ error: 'Features must be an array' });
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        icon: icon || null,
        features: features || [],
        price: price || null,
        duration: duration || null,
        featured: featured || false,
        order: order || 0
      }
    });

    res.status(201).json(service);
  } catch (error) {
    handleError(res, error, 'Create service error:');
  }
});

// Update service (admin)
router.put('/admin/services/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const { title, description, icon, features, price, duration, featured, order } = req.body;

    if (isNaN(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (features !== undefined && !Array.isArray(features)) {
      return res.status(400).json({ error: 'Features must be an array' });
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title,
        description,
        icon: icon || null,
        features: features || [],
        price: price || null,
        duration: duration || null,
        featured: featured || false,
        order: order || 0
      }
    });

    res.json(service);
  } catch (error) {
    handleError(res, error, 'Update service error:');
  }
});

// Delete service (admin)
router.delete('/admin/services/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);

    if (isNaN(serviceId)) {
      return res.status(400).json({ error: 'Invalid service ID' });
    }

    await prisma.service.delete({
      where: { id: serviceId }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete service error:');
  }
});

// Get all experiences (public)
router.get('/experience', async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { startDate: 'desc' }
    });
    res.json(experiences);
  } catch (error) {
    handleError(res, error, 'Get experience error:');
  }
});

// Get contact info (public)
router.get('/contact', async (req, res) => {
  try {
    const contactInfo = await prisma.contactInfo.findMany({
      orderBy: { order: 'asc' }
    });
    
    const socialLinks = await prisma.socialLink.findMany({
      orderBy: { order: 'asc' }
    });

    res.json({
      contactInfo,
      socialLinks
    });
  } catch (error) {
    handleError(res, error, 'Get contact info error:');
  }
});

// Admin routes for managing portfolio data

// Skills management
router.post('/admin/skills', authenticateToken, requireRole(['admin']), [
  body('name').notEmpty().withMessage('Skill name is required'),
  body('level').isInt({ min: 0, max: 100 }).withMessage('Level must be between 0 and 100'),
  body('category').notEmpty().withMessage('Category is required'),
  body('icon').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, level, category, icon, description, order } = req.body;

    const skill = await prisma.skill.create({
      data: {
        name,
        level,
        category,
        icon,
        description,
        order: order || 0
      }
    });

    res.status(201).json({ 
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    handleError(res, error, 'Create skill error:');
  }
});

router.put('/admin/skills/:id', authenticateToken, requireRole(['admin']), [
  body('name').optional().notEmpty().withMessage('Skill name cannot be empty'),
  body('level').optional().isInt({ min: 0, max: 100 }).withMessage('Level must be between 0 and 100'),
  body('category').optional().notEmpty().withMessage('Category cannot be empty'),
  body('icon').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const skillId = parseInt(req.params.id);
    if (isNaN(skillId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const updateData: any = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.level !== undefined) updateData.level = req.body.level;
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.order !== undefined) updateData.order = req.body.order;

    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: updateData
    });

    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    handleError(res, error, 'Update skill error:');
  }
});

router.delete('/admin/skills/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const skillId = parseInt(req.params.id);
    if (isNaN(skillId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.skill.delete({
      where: { id: skillId }
    });

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete skill error:');
  }
});

// Projects management
router.post('/admin/projects', authenticateToken, requireRole(['admin']), [
  body('title').notEmpty().withMessage('Project title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, shortDescription, image, featuredImage, images, technologies, githubUrl, liveUrl, status, featured, order } = req.body;

    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({ error: 'Images must be an array' });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        shortDescription,
        image,
        featuredImage,
        // `images` is a required Json column — default to an empty array when omitted.
        images: images || [],
        technologies: technologies || [],
        githubUrl,
        liveUrl,
        status: status || 'completed',
        featured: featured || false,
        order: order || 0
      }
    });

    res.status(201).json({ 
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    handleError(res, error, 'Create project error:');
  }
});

router.put('/admin/projects/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    if (req.body.images !== undefined && !Array.isArray(req.body.images)) {
      return res.status(400).json({ error: 'Images must be an array' });
    }
    if (req.body.technologies !== undefined && !Array.isArray(req.body.technologies)) {
      return res.status(400).json({ error: 'Technologies must be an array' });
    }

    const updateData: any = {};

    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.shortDescription !== undefined) updateData.shortDescription = req.body.shortDescription;
    if (req.body.image !== undefined) updateData.image = req.body.image;
    if (req.body.featuredImage !== undefined) updateData.featuredImage = req.body.featuredImage;
    if (req.body.images !== undefined) updateData.images = req.body.images;
    if (req.body.technologies) updateData.technologies = req.body.technologies;
    if (req.body.githubUrl !== undefined) updateData.githubUrl = req.body.githubUrl;
    if (req.body.liveUrl !== undefined) updateData.liveUrl = req.body.liveUrl;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.featured !== undefined) updateData.featured = req.body.featured;
    if (req.body.order !== undefined) updateData.order = req.body.order;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData
    });

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    handleError(res, error, 'Update project error:');
  }
});

router.delete('/admin/projects/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete project error:');
  }
});

// Experience management
router.post('/admin/experience', authenticateToken, requireRole(['admin']), [
  body('company').notEmpty().withMessage('Company name is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('technologies').optional().isArray().withMessage('Technologies must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { company, position, description, startDate, endDate, current, location, technologies, order } = req.body;

    const experience = await prisma.experience.create({
      data: {
        company,
        position,
        description,
        startDate,
        endDate,
        current: current || false,
        location,
        technologies: technologies || [],
        order: order || 0
      }
    });

    res.status(201).json({ 
      message: 'Experience created successfully',
      experience
    });
  } catch (error) {
    handleError(res, error, 'Create experience error:');
  }
});

router.put('/admin/experience/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    if (isNaN(experienceId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const updateData: any = {};

    if (req.body.company) updateData.company = req.body.company;
    if (req.body.position) updateData.position = req.body.position;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.startDate) updateData.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) updateData.endDate = req.body.endDate;
    if (req.body.current !== undefined) updateData.current = req.body.current;
    if (req.body.location !== undefined) updateData.location = req.body.location;
    if (req.body.technologies) updateData.technologies = req.body.technologies;
    if (req.body.order !== undefined) updateData.order = req.body.order;

    const experience = await prisma.experience.update({
      where: { id: experienceId },
      data: updateData
    });

    res.json({ message: 'Experience updated successfully', experience });
  } catch (error) {
    handleError(res, error, 'Update experience error:');
  }
});

router.delete('/admin/experience/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const experienceId = parseInt(req.params.id);
    if (isNaN(experienceId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.experience.delete({
      where: { id: experienceId }
    });

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete experience error:');
  }
});

// Contact info management
router.post('/admin/contact', authenticateToken, requireRole(['admin']), [
  body('type').notEmpty().withMessage('Type is required'),
  body('value').notEmpty().withMessage('Value is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, value, icon, order } = req.body;

    const contactInfo = await prisma.contactInfo.create({
      data: {
        type,
        value,
        icon,
        order: order || 0
      }
    });

    res.status(201).json({ 
      message: 'Contact info created successfully',
      contactInfo
    });
  } catch (error) {
    handleError(res, error, 'Create contact info error:');
  }
});

router.put('/admin/contact/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const updateData: any = {};

    if (req.body.type) updateData.type = req.body.type;
    if (req.body.value) updateData.value = req.body.value;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;
    if (req.body.order !== undefined) updateData.order = req.body.order;

    const contactInfo = await prisma.contactInfo.update({
      where: { id: contactId },
      data: updateData
    });

    res.json({ message: 'Contact info updated successfully', contactInfo });
  } catch (error) {
    handleError(res, error, 'Update contact info error:');
  }
});

router.delete('/admin/contact/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const contactId = parseInt(req.params.id);
    if (isNaN(contactId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.contactInfo.delete({
      where: { id: contactId }
    });

    res.json({ message: 'Contact info deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete contact info error:');
  }
});

// Social links management
router.post('/admin/social', authenticateToken, requireRole(['admin']), [
  body('platform').notEmpty().withMessage('Platform is required'),
  body('url').isURL().withMessage('Valid URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { platform, url, icon, order } = req.body;

    const socialLink = await prisma.socialLink.create({
      data: {
        platform,
        url,
        icon,
        order: order || 0
      }
    });

    res.status(201).json({ 
      message: 'Social link created successfully',
      socialLink
    });
  } catch (error) {
    handleError(res, error, 'Create social link error:');
  }
});

router.put('/admin/social/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const socialId = parseInt(req.params.id);
    if (isNaN(socialId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const updateData: any = {};

    if (req.body.platform) updateData.platform = req.body.platform;
    if (req.body.url) updateData.url = req.body.url;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;
    if (req.body.order !== undefined) updateData.order = req.body.order;

    const socialLink = await prisma.socialLink.update({
      where: { id: socialId },
      data: updateData
    });

    res.json({ message: 'Social link updated successfully', socialLink });
  } catch (error) {
    handleError(res, error, 'Update social link error:');
  }
});

router.delete('/admin/social/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const socialId = parseInt(req.params.id);
    if (isNaN(socialId)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    await prisma.socialLink.delete({
      where: { id: socialId }
    });

    res.json({ message: 'Social link deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete social link error:');
  }
});

export default router;