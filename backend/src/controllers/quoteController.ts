import { Request, Response } from 'express';
import Quote from '../models/Quote';
import Lead from '../models/Lead';

// @desc    Create a new quote
// @route   POST /api/quotes
// @access  Private (Contractor)
export const createQuote = async (req: Request, res: Response) => {
  try {
    const {
      leadId,
      totalAmount,
      taxAmount,
      discountAmount,
      afterIncentivesAmount,
      items,
      customFields,
      isFinancingAvailable,
      financingDetails,
      termsAndConditions,
      notes,
      expirationDate,
    } = req.body;

    // Validate required fields
    if (!leadId || !totalAmount || !items || items.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Find lead and check if contractor is assigned to it
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if contractor is assigned to this lead
    const isAssigned = lead.contractors.some(c => c.contractor.toString() === req.user.id);
    if (!isAssigned) {
      return res.status(403).json({ message: 'Not authorized to create a quote for this lead' });
    }

    // Create quote
    const quote = new Quote({
      lead: leadId,
      contractor: req.user.id,
      totalAmount,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      afterIncentivesAmount,
      items,
      customFields,
      isFinancingAvailable: isFinancingAvailable || false,
      financingDetails,
      termsAndConditions,
      notes,
      expirationDate,
      status: 'draft',
    });

    // Save quote
    const savedQuote = await quote.save();

    // Update contractor status in lead
    const contractorIndex = lead.contractors.findIndex(c => c.contractor.toString() === req.user.id);
    if (contractorIndex !== -1) {
      lead.contractors[contractorIndex].status = 'quoted';
      await lead.save();
    }

    res.status(201).json({
      success: true,
      quote: savedQuote,
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all quotes by a contractor
// @route   GET /api/quotes
// @access  Private (Contractor)
export const getQuotesByContractor = async (req: Request, res: Response) => {
  try {
    const { status, leadId, page = 1, limit = 10 } = req.query;

    // Build query
    let query: any = { contractor: req.user.id };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by lead if provided
    if (leadId) {
      query.lead = leadId;
    }

    // Count total documents
    const total = await Quote.countDocuments(query);

    // Execute query with pagination
    const quotes = await Quote.find(query)
      .populate('lead', 'address city state zipCode')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: quotes.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      quotes,
    });
  } catch (error) {
    console.error('Error getting quotes:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get quotes for a specific lead
// @route   GET /api/quotes/lead/:leadId
// @access  Private (Homeowner, Contractor assigned to lead, Admin)
export const getQuotesForLead = async (req: Request, res: Response) => {
  try {
    const { leadId } = req.params;

    // Find lead
    const lead = await Lead.findById(leadId);
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
      return res.status(403).json({ message: 'Not authorized to access quotes for this lead' });
    }

    // Get quotes for this lead
    const quotes = await Quote.find({ lead: leadId })
      .populate('contractor', 'firstName lastName company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotes.length,
      quotes,
    });
  } catch (error) {
    console.error('Error getting quotes for lead:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get a specific quote
// @route   GET /api/quotes/:id
// @access  Private (Homeowner, Contractor who created quote, Admin)
export const getQuote = async (req: Request, res: Response) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('lead', 'address city state zipCode propertyType')
      .populate('contractor', 'firstName lastName company phone email');

    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Check if user has access to this quote
    const lead = await Lead.findById(quote.lead);
    
    if (
      req.user.role !== 'admin' && 
      req.user.id !== quote.contractor.toString() && 
      req.user.id !== lead?.homeowner?.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to access this quote' });
    }

    // If homeowner is viewing the quote and status is "sent", update to "viewed"
    if (req.user.id === lead?.homeowner?.toString() && quote.status === 'sent') {
      quote.status = 'viewed';
      quote.viewedDate = new Date();
      await quote.save();
    }

    res.status(200).json({
      success: true,
      quote,
    });
  } catch (error) {
    console.error('Error getting quote:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update quote status
// @route   PATCH /api/quotes/:id/status
// @access  Private (Contractor who created quote, Homeowner for accepting/rejecting)
export const updateQuoteStatus = async (req: Request, res: Response) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Please provide a status' });
    }

    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    // Check permissions based on the requested status change
    const lead = await Lead.findById(quote.lead);
    
    if (status === 'sent') {
      // Only contractor can set status to sent
      if (req.user.id !== quote.contractor.toString()) {
        return res.status(403).json({ message: 'Only the contractor can send the quote' });
      }
    } else if (status === 'accepted' || status === 'rejected') {
      // Only homeowner can accept or reject
      if (req.user.id !== lead?.homeowner?.toString()) {
        return res.status(403).json({ message: 'Only the homeowner can accept or reject the quote' });
      }
      
      // If rejecting, require a reason
      if (status === 'rejected' && !rejectionReason) {
        return res.status(400).json({ message: 'Please provide a rejection reason' });
      }
    } else {
      // Other status changes only by contractor who created the quote
      if (req.user.id !== quote.contractor.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this quote' });
      }
    }

    // Update status and relevant date fields
    quote.status = status;
    
    if (status === 'sent') {
      quote.sentDate = new Date();
    } else if (status === 'viewed') {
      quote.viewedDate = new Date();
    } else if (status === 'accepted') {
      quote.acceptedDate = new Date();
      
      // Also update lead and contractor status
      if (lead) {
        const contractorIndex = lead.contractors.findIndex(c => c.contractor.toString() === quote.contractor.toString());
        if (contractorIndex !== -1) {
          lead.contractors[contractorIndex].status = 'won';
          lead.status = 'completed';
          await lead.save();
        }
      }
    } else if (status === 'rejected') {
      quote.rejectedDate = new Date();
      quote.rejectionReason = rejectionReason;
    }

    const updatedQuote = await quote.save();

    res.status(200).json({
      success: true,
      quote: updatedQuote,
    });
  } catch (error) {
    console.error('Error updating quote status:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

export default {
  createQuote,
  getQuotesByContractor,
  getQuotesForLead,
  getQuote,
  updateQuoteStatus,
};