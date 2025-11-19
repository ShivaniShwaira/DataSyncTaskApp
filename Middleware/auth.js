const jwt = require("jsonwebtoken")
const userModel = require('../Models/userModel');

module.exports.authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token not found",
        data: []
      });
    }

    const token = authHeader.split(" ").pop();

    // Decoded token
    const decoded = jwt.verify(token, "process.env.PRIVATE_KEY");
    const { UserId } = decoded;

    // Find user
    const user = await userModel.findOne({ _id: UserId, isDeleted: false });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
        data: []
      });
    }

    req.user = user; // Attach user data to request
    next();

  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
      data: []
    });
  }
};