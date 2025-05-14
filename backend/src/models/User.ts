import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

// Define user schema
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['homeowner', 'contractor', 'admin'],
      default: 'homeowner',
    },
    // Contractor specific fields
    company: {
      type: String,
      required: function() {
        return this.role === 'contractor';
      },
      trim: true,
    },
    companyDescription: {
      type: String,
    },
    website: {
      type: String,
      validate: {
        validator: function(v: string) {
          return v ? validator.isURL(v) : true;
        },
        message: 'Please provide a valid URL',
      },
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'USA',
      },
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    serviceAreas: [
      {
        zipCode: String,
        city: String,
        state: String,
        country: {
          type: String,
          default: 'USA',
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDate: {
      type: Date,
    },
    verificationDocuments: [
      {
        documentType: {
          type: String,
          enum: ['license', 'insurance', 'certification', 'businessRegistration', 'other'],
        },
        documentUrl: String,
        documentName: String,
        dateUploaded: {
          type: Date,
          default: Date.now,
        },
        expiryDate: Date,
        verificationStatus: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending',
        },
      },
    ],
    // Contractor preferences
    leadPreferences: {
      maxDailyLeads: {
        type: Number,
        default: 0, // 0 means no limit
      },
      maxWeeklyLeads: {
        type: Number,
        default: 0, // 0 means no limit
      },
      maxMonthlyBudget: {
        type: Number,
        default: 0, // 0 means no limit
      },
      leadRadius: {
        type: Number,
        default: 50, // in miles
      },
      preferredPropertyTypes: {
        type: [String],
        default: ['single_family', 'multi_family', 'commercial', 'other'],
      },
      preferredTimelines: {
        type: [String],
        default: ['immediate', 'within_month', 'within_three_months', 'future', 'researching'],
      },
      acceptsExclusiveLeads: {
        type: Boolean,
        default: true,
      },
      acceptsSharedLeads: {
        type: Boolean,
        default: true,
      },
    },
    // Notifications preferences
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: true,
      },
      app: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Add index for searching
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  company: 'text',
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

const User = mongoose.model('User', userSchema);

export default User;