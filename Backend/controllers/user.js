import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from 'crypto';
import { sendVerificationEmail, sendWelcomeEmail, sendResetSuccessEmail, sendPasswordResetEmail, sendVerificationSMS, sendPasswordResetSMS } from "../middlewares/emails.js";
import {
  signTokenForConsumer,
} from "../middlewares/index.js";
import { generateVerificationCode } from "../utils/generateVerificationCode.js";

const loginUser = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Check if either email or phone is provided
    const user = await userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user does not exist",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    const tokenData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    const token = await signTokenForConsumer(tokenData);

    if (token) {
      return res.status(200).json({
        success: true,
        token,
        userId: user._id,
        name: user.name,
        email: user.email,
        cartItems: user.cartItems,
        message: "Logged in successfully",
        user: {
          ...user._doc,
          password: undefined, // Exclude password from response
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Error generating token",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Some internal error occurred",
    });
  }
};



const verifyCode = async (req, res) => {

  const { code } = req.body;

  try {
    const user = await userModel.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    if (user.email) {
      await sendWelcomeEmail(user.email, user.name);

      return res.json({
        success: true,
        user: {
          ...user._doc,
          password: undefined
        },
        message: "Email verified successfully",
      });
    } else if (user.phone) {
      return res.json({
        success: true,
        user: {
          ...user._doc,
          password: undefined
        },
        message: "User verified successfully",
      });
    }

  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Error in verifying email",
    });
  }
}

const verifyUser = async (req, res) => {
  const { userId, verifyType } = req.body;

  try {
    // Find the user by userId
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.json({
        success: false,
        message: "User is already verified.",
      });
    }

    // Check the verification type (email or phone)
    if (verifyType === "email") {
      // Validate email
      if (!user.email) {
        return res.json({
          success: false,
          message: "No email is associated with this user.",
        });
      }

      // Generate a new verification code
      const verificationCode = generateVerificationCode();
      user.verificationToken = verificationCode;
      user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

      // Save the user with updated verification details
      await user.save();

      // Send verification email
      await sendVerificationEmail(user.email, verificationCode);

      return res.json({
        success: true,
        message: "Verification email sent.",
        user
      });
    } else if (verifyType === "phone") {
      // Validate phone number
      if (!user.phone) {
        return res.json({
          success: false,
          message: "No phone number is associated with this user.",
        });
      }

      // Generate a new verification code
      const verificationCode = generateVerificationCode();
      user.verificationToken = verificationCode;
      user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

      // Save the user with updated verification details
      await user.save();

      // Send verification SMS
      await sendVerificationSMS(user.phone, verificationCode);

      return res.json({
        success: true,
        message: "Verification SMS sent.",
      });
    } else {
      // If the verifyType is neither email nor phone
      return res.json({
        success: false,
        message: "Invalid verification type. Please use 'email' or 'phone'.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "An error occurred during the verification process.",
    });
  }
};

const registerUser = async (req, res) => {
  const { name, password, email, phone, type } = req.body;
  console.log(req.body);

  try {
    // Check if a user exists with the given email or phone number
    const existingUser = await userModel.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      if (!existingUser.isVerified) {
        // Remove the unverified user from the database
        await userModel.deleteOne({ _id: existingUser._id });
        console.log(`Unverified user with email ${email} or phone ${phone} has been removed from the database.`);
      } else {
        // If the user is verified, inform that the user already exists
        return res.json({
          success: false,
          message: "User already exists with this email or phone.",
        });
      }
    }

    // Validate the input based on the signup type
    if (type === "email" && email) {
      // Validate email format
      if (!validator.isEmail(email)) {
        return res.json({
          success: false,
          message: "Please enter a valid email.",
        });
      }

      // Validate password length
      if (password.length < 8) {
        return res.json({
          success: false,
          message: "The password must be at least 8 characters long.",
        });
      }

      // Generate verification code and hash the password
      const verificationCode = generateVerificationCode();
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      // Create a new user
      const newUser = new userModel({
        name,
        email,
        phone,
        password: hashedPass,
        verificationToken: verificationCode,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        signupMethod: "email",
      });

      const user = await newUser.save();

      // Send verification email
      await sendVerificationEmail(email, verificationCode);

      return res.json({
        success: true,
        userId: user._id,
        message: "Account created with email.",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    } 
    else if (type === "phone" && phone) {
      // Validate phone number format
      if (!validator.isMobilePhone(phone, 'any')) {
        return res.json({
          success: false,
          message: "Please enter a valid phone number.",
        });
      }

      // Validate password length
      if (password.length < 8) {
        return res.json({
          success: false,
          message: "The password must be at least 8 characters long.",
        });
      }

      // Generate verification code and hash the password
      const verificationCode = generateVerificationCode();
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);

      // Create a new user
      const newUser = new userModel({
        name,
        phone,
        email,
        password: hashedPass,
        verificationToken: verificationCode,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        signupMethod: "phone",
      });

      const user = await newUser.save();

      // Send verification SMS
      await sendVerificationSMS(phone, verificationCode);

      return res.json({
        success: true,
        userId: user._id,
        message: "Account successfully created with phone number.",
        user: {
          ...user._doc,
          password: undefined,
        },
      });
    }

    return res.json({
      success: false,
      message: "Please provide either an email or a phone number.",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Some internal error occurred.",
    });
  }
};


const forgotPassword = async (req, res) => {
  const { contact } = req.body; // Only one field: contact
  console.log("Request Body:", req.body);

  try {
    let user;

    // Check if contact is an email
    if (contact.includes('@')) {
      user = await userModel.findOne({ email: contact });
      if (!user) {
        return res.status(400).json({ success: false, message: "No user found with this email." });
      }
    } 
    // Otherwise, assume it's a phone number
    else {
      user = await userModel.findOne({ phone: contact });
      if (!user) {
        return res.status(400).json({ success: false, message: "No user found with this phone number." });
      }
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: "User is not verified." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    console.log("Reset Token:", resetToken);
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour expiration

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;

    await user.save();

    // Send password reset email or SMS based on user type
    if (user.email === contact) {
      await sendPasswordResetEmail(user.email, `http://localhost:5173/reset-password/${resetToken}`);
    } else {
      await sendPasswordResetSMS(user.phone, `http://localhost:5173/reset-password/${resetToken}`);
    }

    return res.status(200).json({ success: true, message: "Password reset instructions sent." });
  } catch (error) {
    console.log("Error in forgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Some internal error occurred.",
    });
  }
};



  const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
      const user = await userModel.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid request" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpiresAt = undefined;
      await user.save();

      await sendResetSuccessEmail(user.email);

      return res.status(200).json({ success: true, message: "Password has been reset successfully, redirecting to login..." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Some Internal Error Occurred",
      });
    }
  };

  const checkAuth = async (req, res) => {
    try {
      const user = await userModel.findById(req.userId).select("-password"); //- so that the password is unselected so we do not need to set the pass as undefined.

      if (!user) return res.status(400).json({ success: false, message: "User not found" });

      res.status(200).json({ success: true, user });

    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  export { loginUser, registerUser, verifyCode, forgotPassword, resetPassword, checkAuth, verifyUser };
