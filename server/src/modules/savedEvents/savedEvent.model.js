import mongoose from 'mongoose';

const savedEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    editionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventEdition',
      required: true,
      index: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure user can't save same event twice
savedEventSchema.index({ userId: 1, editionId: 1 }, { unique: true });

// Index for querying user's saved events sorted by date
savedEventSchema.index({ userId: 1, savedAt: -1 });

const SavedEvent = mongoose.model('SavedEvent', savedEventSchema);

export default SavedEvent;
