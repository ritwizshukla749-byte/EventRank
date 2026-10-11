import mongoose from 'mongoose';

const eventEditionSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Base event reference is required'],
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Host college ID is required'],
      index: true,
    },
    editionLabel: {
      type: String,
      default: 'Edition 1',
      trim: true,
    },
    eligibility: {
      type: String,
      enum: ['host_college_only', 'selected_colleges', 'all_active_colleges'],
      default: 'all_active_colleges',
      index: true,
    },
    allowedCollegeIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
      },
    ],
    startAt: {
      type: Date,
      required: [true, 'Event start date/time is required'],
      index: true,
    },
    endAt: {
      type: Date,
      required: [true, 'Event end date/time is required'],
      validate: {
        validator: function (value) {
          return !this.startAt || value >= this.startAt;
        },
        message: 'End date/time must be greater than or equal to start date/time',
      },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    venue: {
      type: String,
      required: [true, 'Venue location is required'],
      trim: true,
    },
    costAmount: {
      type: Number,
      default: 0,
      min: [0, 'Cost amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    registrationOpensAt: {
      type: Date,
    },
    registrationClosesAt: {
      type: Date,
    },
    capacity: {
      type: Number,
      default: null,
    },
    registrationMode: {
      type: String,
      enum: ['platform', 'external', 'closed'],
      default: 'platform',
    },
    externalRegistrationUrl: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'published', 'completed', 'cancelled'],
      default: 'published',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding published events by host college and date
eventEditionSchema.index({ collegeId: 1, status: 1, startAt: 1 });
eventEditionSchema.index({ status: 1, startAt: 1 });

export const EventEdition = mongoose.model('EventEdition', eventEditionSchema);
