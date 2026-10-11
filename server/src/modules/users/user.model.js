import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Prevent password leaking in API responses
    },
    globalRole: {
      type: String,
      enum: ['user', 'platform_admin'],
      default: 'user',
      index: true,
    },
    collegeRole: {
      type: String,
      enum: ['student', 'organizer', 'college_admin'],
      default: 'student',
      index: true,
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: function () {
        // Platform admin can be independent of a specific college; other roles must be college-associated
        return this.globalRole !== 'platform_admin';
      },
      index: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    academicYear: {
      type: Number,
      min: 1,
      max: 6,
      default: 1,
    },
    interests: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    preferredEventTypes: {
      type: [String],
      default: [],
    },
    budgetMax: {
      type: Number,
      default: null,
    },
    privacyPreferences: {
      showInPeerCounts: {
        type: Boolean,
        default: true,
      },
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const User = mongoose.model('User', userSchema);
