import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false }, // Email is optional
    phone: { type: String, required: false }, // Phone is optional
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    signupMethod: {
      type: String,
      enum: ['email', 'phone'], // Indicate how the user signed up
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    role: {
      type: String,
      enum: ["ADMIN", "USER", "MANAGER"],
      default: "USER",
      required: true,
    },
    cartData: { type: Object, default: {} },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("User", userSchema);
export default userModel;
