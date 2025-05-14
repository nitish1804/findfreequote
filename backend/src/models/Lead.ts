import mongoose from 'mongoose';

// Define lead schema
const leadSchema = new mongoose.Schema(
  {
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Can be null for guest users
    },
    guestFirstName: {
      type: String,
      required: function() {
        return this.homeowner === undefined || this.homeowner === null;
      },
    },
    guestLastName: {
      type: String,
      required: function() {
        return this.homeowner === undefined || this.homeowner === null;
      },
    },
    guestEmail: {
      type: String,
      required: function() {
        return this.homeowner === undefined || this.homeowner === null;
      },
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    guestPhone: {
      type: String,
      required: function() {
        return this.homeowner === undefined || this.homeowner === null;
      },
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    status: {
      type: String,
      enum: ['new', 'verified', 'distributed', 'in_progress', 'completed', 'expired', 'invalid'],
      default: 'new',
    },
    leadScore: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'USA',
    },
    propertyType: {
      type: String,
      enum: ['single_family', 'multi_family', 'commercial', 'other'],
      required: true,
    },
    projectTimeline: {
      type: String,
      enum: ['immediate', 'within_month', 'within_three_months', 'future', 'researching'],
      required: true,
    },
    budgetRange: {
      type: String,
    },
    isHomeowner: {
      type: Boolean,
      default: true,
    },
    monthlyUtilityBill: {
      type: Number,
    },
    roofAge: {
      type: Number,
    },
    squareFootage: {
      type: Number,
    },
    // Other custom fields can be added here depending on service
    customFields: {
      type: Map,
      of: String,
    },
    // Track contractors that have received this lead
    contractors: [
      {
        contractor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['new', 'viewed', 'contacted', 'quoted', 'won', 'lost'],
          default: 'new',
        },
        isExclusive: {
          type: Boolean,
          default: false,
        },
        assignedAt: {
          type: Date,
          default: Date.now,
        },
        leadCost: {
          type: Number,
          default: 0,
        },
        notes: String,
      }
    ],
    // Track verification history
    verifications: [
      {
        verifiedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        verificationDate: {
          type: Date,
          default: Date.now,
        },
        verificationMethod: {
          type: String,
          enum: ['phone', 'email', 'address_check', 'manual'],
        },
        verificationNotes: String,
        isVerified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: function() {
        // Leads expire after 30 days by default
        const now = new Date();
        now.setDate(now.getDate() + 30);
        return now;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add text index for searching
leadSchema.index({
  city: 'text',
  state: 'text',
  zipCode: 'text',
  description: 'text',
});

// Middleware to check if lead is expired
leadSchema.pre('find', function(next) {
  this.where({ expiresAt: { $gt: new Date() } });
  next();
});

// Calculate lead score before saving
leadSchema.pre('save', function(next) {
  // Scoring logic based on various factors
  let score = 50; // Base score
  
  // Higher score for urgent timeline
  if (this.projectTimeline === 'immediate') {
    score += 30;
  } else if (this.projectTimeline === 'within_month') {
    score += 20;
  } else if (this.projectTimeline === 'within_three_months') {
    score += 10;
  }
  
  // Higher score for homeowners
  if (this.isHomeowner) {
    score += 10;
  }
  
  // Higher score if budget is provided
  if (this.budgetRange) {
    score += 5;
  }
  
  // Cap the score at 100
  this.leadScore = Math.min(score, 100);
  
  next();
});

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;