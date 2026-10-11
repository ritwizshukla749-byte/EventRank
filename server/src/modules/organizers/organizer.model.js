import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['club', 'society', 'department', 'authorized_entity'],
      default: 'club',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Host college ID is required'],
      index: true,
    },
    authorizedUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'suspended'],
      default: 'approved',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to scope organizer lookup within an institution
organizerSchema.index({ collegeId: 1, name: 1 }, { unique: true });

export const Organizer = mongoose.model('Organizer', organizerSchema);
