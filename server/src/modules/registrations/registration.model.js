import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    eventEditionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EventEdition',
      required: [true, 'Event edition reference is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: [true, 'Student college ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['registered', 'cancelled', 'attended'],
      default: 'registered',
      index: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
    },
    attendanceVerificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceVerification',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations for the same edition and user
registrationSchema.index({ eventEditionId: 1, userId: 1 }, { unique: true });

// Optimize aggregate peer counts scoped to student's college
registrationSchema.index({ eventEditionId: 1, collegeId: 1, status: 1 });

export const Registration = mongoose.model('Registration', registrationSchema);
