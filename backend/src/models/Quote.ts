import mongoose from 'mongoose';

// Quote Schema
const quoteSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    afterIncentivesAmount: {
      type: Number,
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
        sortOrder: {
          type: Number,
          default: 0,
        },
      },
    ],
    customFields: {
      type: Map,
      of: String,
    },
    isFinancingAvailable: {
      type: Boolean,
      default: false,
    },
    financingDetails: {
      type: String,
    },
    termsAndConditions: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'],
      default: 'draft',
    },
    expirationDate: {
      type: Date,
    },
    sentDate: {
      type: Date,
    },
    viewedDate: {
      type: Date,
    },
    acceptedDate: {
      type: Date,
    },
    rejectedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate quote number before saving
quoteSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Find the last quote
    const lastQuote = await this.constructor.findOne({}, {}, { sort: { createdAt: -1 } });

    // Generate quote number
    if (!lastQuote) {
      this.quoteNumber = 'Q-0001';
    } else {
      const lastQuoteNumber = lastQuote.quoteNumber;
      const lastQuoteNumberInt = parseInt(lastQuoteNumber.split('-')[1]);
      this.quoteNumber = `Q-${(lastQuoteNumberInt + 1).toString().padStart(4, '0')}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Quote = mongoose.model('Quote', quoteSchema);

export default Quote;