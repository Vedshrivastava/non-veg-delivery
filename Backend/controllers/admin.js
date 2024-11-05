import userModel from "../models/user.js";
import bcrypt from "bcrypt";
import { signTokenForAdmin, signTokenForManager } from "../middlewares/index.js";

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await userModel.findOne({ email });

    if (!admin || (admin.role !== "ADMIN" && admin.role !== "MANAGER")) {
      return res.status(400).json({
        success: false,
        message: "Admin or manager does not exist with the provided email",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const tokenData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    };

    // Sign token based on role
    let token;
    if (admin.role === "ADMIN") {
      token = await signTokenForAdmin(tokenData);
    } else if (admin.role === "MANAGER") {
      token = await signTokenForManager(tokenData);
    }

    if (token) {
      return res.status(200).json({
        success: true,
        token,
        userId: admin._id,
        name: admin.name,
        email: admin.email,
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
