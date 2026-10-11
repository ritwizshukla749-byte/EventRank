import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organizer',
      required: [true, 'Organizer ID is required'],
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Host college ID is required'],
      index: true,
    },
    eventType: {
      type: String,
      enum: ['hackathon', 'workshop', 'competition', 'cultural', 'talk', 'social', 'career'],
      required: [true, 'Event type is required'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    expectedOutcomes: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Event = mongoose.model('Event', eventSchema);
