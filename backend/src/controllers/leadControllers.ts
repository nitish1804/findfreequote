import { Request, Response } from 'express';
import Lead from '../models/Lead';
import User from '../models/User';
import Service from '../models/Service';

// @desc    Create a new lead
// @route   POST /api/leads
// @access  Public
export const createLead = async (req: Request, res: Response) => {
  try {
    const {
      service,
      address,
      city,
      state,
      zipCode,
      propertyType,
      projectTimeline,
      budgetRange,
      isHomeowner,
      firstName,
      lastName,
      email,
      phone,
      customFields,
      monthlyUtilityBill,
      roofAge,
      squareFootage,
    } = req.body;

    // Validate required fields
    if (!service || !address || !city || !state || !zipCode || !propertyType || !projectTimeline) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if service exists
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user is authenticated
    let homeowner = null;
    if (req.user && req.user.id) {
      homeowner = req.user.id;
    } else {
      // For guest users, validate contact information
      if (!firstName || !lastName || !email || !phone) {
        return res.status(400).json({ message: 'Please provide contact information' });
      }
    }

    // Create the lead
    const lead = new Lead({
      homeowner,
      guestFirstName: firstName,
      guestLastName: lastName,
      guestEmail: email,
      guestPhone: phone,
      service,
      address,
      city,
      state,
      zipCode,
      propertyType,
      projectTimeline,
      budgetRange,
      isHomeowner,
      customFields,
      monthlyUtilityBill,
      roofAge,
      squareFootage,
    });

    // Save the lead
    const savedLead = await lead.save();

    res.status(201).json({
      success: true,
      lead: savedLead,
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Admin, Contractor)
export const getLeads = async (req: Request, res: Response) => {
  try {
    const { status, service, sort, page = 1, limit = 10 } = req.query;

    // Build query
    let query: any = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by service if provided
    if (service) {
      query.service = service;
    }

    // For contractors, only show leads assigned to them
    if (req.user.role === 'contractor') {
      query['contractors.contractor'] = req.user.id;
    }

    // For homeowners, only show their own leads
    if (req.user.role === 'homeowner') {
      query.homeowner = req.user.id;
    }

    // Count total documents
    const total = await Lead.countDocuments(query);

    // Build sort options
    let sortOptions = {};
    if (sort) {
      const sortField = sort.toString().startsWith('-') ? sort.toString().substring(1) : sort.toString();
      const sortDirection = sort.toString().startsWith('-') ? -1 : 1;
      sortOptions[sortField] = sortDirection;
    } else {
      // Default sort by createdAt DESC
      sortOptions = { createdAt: -1 };
    }

    // Execute query with pagination
    const leads = await Lead.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('service', 'name')
      .populate('homeowner', 'firstName lastName email')
      .populate('contractors.contractor', 'firstName lastName company');

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      leads,
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get a single lead
// @route   GET /api/leads/:id
// @access  Private
export const getLead = async (req: Request, res: Response) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('service', 'name description')
      .populate('homeowner', 'firstName lastName email phone')
      .populate('contractors.contractor', 'firstName lastName company phone email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if user has access to this lead
    const isContractor = lead.contractors.some(c => c.contractor.toString() === req.user.id);
    
    if (
      req.user.role !== 'admin' && 
      req.user.id !== lead.homeowner?.toString() && 
      !isContractor
    ) {
      return res.status(403).json({ message: 'Not authorized to access this lead' });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error('Error getting lead:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private (Admin, Contractor assigned to lead)
export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide a status' });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if user has permission to update this lead
    const isContractor = lead.contractors.some(c => c.contractor.toString() === req.user.id);
    
    if (
      req.user.role !== 'admin' &&
      !isContractor
    ) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    // Update the status
    lead.status = status;

    // If marking as verified, add verification record
    if (status === 'verified') {
      lead.verifications.push({
        verifiedBy: req.user.id,
        verificationMethod: 'manual',
        verificationNotes: 'Manually verified by admin',
        isVerified: true,
      });
    }

    const updatedLead = await lead.save();

    res.status(200).json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Assign lead to contractor
// @route   POST /api/leads/:id/assign
// @access  Private (Admin)
export const assignLeadToContractor = async (req: Request, res: Response) => {
  try {
    const { contractorId, isExclusive, leadCost } = req.body;

    if (!contractorId) {
      return res.status(400).json({ message: 'Please provide a contractor ID' });
    }

    // Check if contractor exists and is a contractor
    const contractor = await User.findOne({ _id: contractorId, role: 'contractor' });
    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if contractor is already assigned to this lead
    if (lead.contractors.some(c => c.contractor.toString() === contractorId)) {
      return res.status(400).json({ message: 'Contractor already assigned to this lead' });
    }

    // Add contractor to lead
    lead.contractors.push({
      contractor: contractorId,
      isExclusive: isExclusive || false,
      leadCost: leadCost || 0,
    });

    // If lead is in 'verified' status, update to 'distributed'
    if (lead.status === 'verified') {
      lead.status = 'distributed';
    }

    const updatedLead = await lead.save();

    res.status(200).json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error assigning lead to contractor:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update contractor status for a lead
// @route   PATCH /api/leads/:id/contractor-status
// @access  Private (Contractor)
export const updateContractorStatus = async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide a status' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Find the contractor entry
    const contractorIndex = lead.contractors.findIndex(
      c => c.contractor.toString() === req.user.id
    );

    if (contractorIndex === -1) {
      return res.status(403).json({ message: 'Not authorized to update this lead' });
    }

    // Update the contractor status
    lead.contractors[contractorIndex].status = status;
    if (notes) {
      lead.contractors[contractorIndex].notes = notes;
    }

    // Update overall lead status based on contractor status if needed
    if (status === 'won' && lead.status !== 'completed') {
      lead.status = 'completed';
    }

    const updatedLead = await lead.save();

    res.status(200).json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error updating contractor status:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Verify a lead
// @route   POST /api/leads/:id/verify
// @access  Private (Admin)
export const verifyLead = async (req: Request, res: Response) => {
  try {
    const { method, notes } = req.body;

    if (!method) {
      return res.status(400).json({ message: 'Please provide a verification method' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Add verification record
    lead.verifications.push({
      verifiedBy: req.user.id,
      verificationMethod: method,
      verificationNotes: notes || '',
      isVerified: true,
    });

    // Update lead status to verified
    lead.status = 'verified';

    const updatedLead = await lead.save();

    res.status(200).json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error('Error verifying lead:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export default {
  createLead,
  getLeads,
  getLead,
  updateLeadStatus,
  assignLeadToContractor,
  updateContractorStatus,
  verifyLead,
};