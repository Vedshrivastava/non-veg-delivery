import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import { signTokenForAdmin, signTokenForManager } from "../middlewares/index.js";

const loginAdmin = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Validate that at least email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide either email or phone.",
      });
    }

    // Find admin or manager by email or phone
    const admin = await userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
      return res.status(400).json({
        success: false,
        message: "Admin or manager does not exist with the provided credentials",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Token data for user
    const tokenData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    };

    // Generate token based on role
    let token;
    if (admin.role === "ADMIN") {
      token = await signTokenForAdmin(tokenData);
    } else if (admin.role === "MANAGER") {
      token = await signTokenForManager(tokenData);
    }

    // Respond with token if successful
    if (token) {
      return res.status(200).json({
        success: true,
        token,
        userId: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        message: "Logged in successfully",
        user: {
          ...admin._doc,
          password: undefined, // Exclude password
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

export { loginAdmin };
