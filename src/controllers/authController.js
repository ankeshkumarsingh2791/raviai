const User = require("../models/User");
const Otp  = require("../models/Otp");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

const getJwtCookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24,
});

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// ─── Register ──────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    // verify OTP
    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const user = await User.create({ name, email, password, role });

     await Otp.deleteMany({ email });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Login ─────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check role matches
    if (role && user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Access denied. You are not registered as ${role}.`,
      });
    }

    const token = signToken(user);
    const userData = buildUserResponse(user);

    res.cookie("token", token, getJwtCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Logout ────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    res.clearCookie("token", getJwtCookieOptions());
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Get Current Session User ──────────────────────────────────────
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not logged in",
      });
    }
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── Send OTP ──────────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // generate 6 digit OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // save new OTP — pre-save hook sends the email
    await Otp.create({ email, otp });

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, logout, getMe, sendOtp };
