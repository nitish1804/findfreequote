import mongoose from 'mongoose';

// Service Category Schema
const serviceCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: String,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Service Schema
const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceCategory',
      required: [true, 'Service category is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    icon: {
      type: String,
    },
    features: [String],
    benefits: [String],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    formFields: [
      {
        name: String,
        label: String,
        type: {
          type: String,
          enum: ['text', 'number', 'select', 'radio', 'checkbox', 'textarea'],
        },
        options: [String], // For select, radio, checkbox
        isRequired: {
          type: Boolean,
          default: false,
        },
        displayOrder: {
          type: Number,
          default: 0,
        },
      },
    ],
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    leadCost: {
      exclusive: {
        type: Number,
        default: 0,
      },
      shared: {
        type: Number,
        default: 0,
      },
    },
    metaTitle: String,
    metaDescription: String,
    image: String,
  },
  {
    timestamps: true,
  }
);

// Add text index for searching
serviceCategorySchema.index({
  name: 'text',
  description: 'text',
});

serviceSchema.index({
  name: 'text',
  description: 'text',
});

// Models
const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);
const Service = mongoose.model('Service', serviceSchema);

export { ServiceCategory, Service };
export default Service;