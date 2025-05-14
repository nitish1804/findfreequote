import { Request, Response } from 'express';
import { Service, ServiceCategory } from '../models/Service';

// @desc    Get all service categories
// @route   GET /api/services/categories
// @access  Public
export const getServiceCategories = async (req: Request, res: Response) => {
  try {
    const { isActive = true } = req.query;

    // Build query
    let query: any = {};
    
    // Filter by isActive if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await ServiceCategory.find(query)
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Error getting service categories:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req: Request, res: Response) => {
  try {
    const { categoryId, isActive = true } = req.query;

    // Build query
    let query: any = {};
    
    // Filter by category if provided
    if (categoryId) {
      query.category = categoryId;
    }
    
    // Filter by isActive if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const services = await Service.find(query)
      .populate('category', 'name slug')
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get a single service
// @route   GET /api/services/:id
// @access  Public
export const getService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('category', 'name slug');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Error getting service:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get a service by slug
// @route   GET /api/services/slug/:slug
// @access  Public
export const getServiceBySlug = async (req: Request, res: Response) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Error getting service by slug:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create a service category
// @route   POST /api/services/categories
// @access  Private (Admin)
export const createServiceCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, slug, icon, displayOrder, isActive } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ message: 'Please provide name and slug' });
    }

    // Check if category already exists
    const categoryExists = await ServiceCategory.findOne({ 
      $or: [{ name }, { slug }]
    });

    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create category
    const category = await ServiceCategory.create({
      name,
      description,
      slug,
      icon,
      displayOrder,
      isActive,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error creating service category:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private (Admin)
export const createService = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      category, 
      description, 
      slug, 
      icon, 
      features, 
      benefits, 
      faqs, 
      formFields, 
      displayOrder, 
      isActive,
      leadCost,
      metaTitle,
      metaDescription,
      image
    } = req.body;

    // Validate required fields
    if (!name || !category || !slug) {
      return res.status(400).json({ message: 'Please provide name, category, and slug' });
    }

    // Check if service already exists
    const serviceExists = await Service.findOne({ 
      $or: [{ name, category }, { slug }]
    });

    if (serviceExists) {
      return res.status(400).json({ message: 'Service already exists' });
    }

    // Check if category exists
    const categoryExists = await ServiceCategory.findById(category);

    if (!categoryExists) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Create service
    const service = await Service.create({
      name,
      category,
      description,
      slug,
      icon,
      features,
      benefits,
      faqs,
      formFields,
      displayOrder,
      isActive,
      leadCost,
      metaTitle,
      metaDescription,
      image
    });

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export default {
  getServiceCategories,
  getServices,
  getService,
  getServiceBySlug,
  createServiceCategory,
  createService,
};