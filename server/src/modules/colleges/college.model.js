import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'College slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended'],
      default: 'active',
      index: true,
    },
    website: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      trim: true,
    },
    allowedEmailDomains: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const College = mongoose.model('College', collegeSchema);
