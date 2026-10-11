import mongoose from 'mongoose';

const reviewDimensionsSchema = new mongoose.Schema(
  {
    organization: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    contentValue: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    networking: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    timeCostValue: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    eventEditionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventEdition',
      required: [true, 'Event edition reference is required'],
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event series reference is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    attendanceVerificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceVerification',
      required: [true, 'Attendance verification is mandatory for official review'],
    },
    dimensions: {
      type: reviewDimensionsSchema,
      required: [true, 'Review dimensions are required'],
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      maxlength: [1000, 'Review text cannot exceed 1000 characters'],
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['submitted', 'published', 'under_review', 'hidden'],
      default: 'published',
      index: true,
    },
    conflictFlags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook: auto-calculate overallRating as unweighted average of dimensions
reviewSchema.pre('save', function (next) {
  if (this.dimensions) {
    const { organization, contentValue, networking, timeCostValue } = this.dimensions;
    const avg = (organization + contentValue + networking + timeCostValue) / 4;
    this.overallRating = Math.round(avg * 10) / 10;
  }
  next();
});

// Enforce one review per user per event edition
reviewSchema.index({ eventEditionId: 1, userId: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
