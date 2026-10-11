import mongoose from 'mongoose';

const attendanceVerificationSchema = new mongoose.Schema(
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
    method: {
      type: String,
      enum: ['organizer_checkin', 'dynamic_token', 'admin_verified', 'approved_import'],
      required: [true, 'Verification method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified',
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Verified by trusted actor ID is required'],
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    evidenceReference: {
      type: String,
      default: '',
    },
    auditMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// One verified attendance record per user per event edition
attendanceVerificationSchema.index({ eventEditionId: 1, userId: 1 }, { unique: true });

export const AttendanceVerification = mongoose.model(
  'AttendanceVerification',
  attendanceVerificationSchema
);
