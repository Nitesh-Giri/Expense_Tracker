import jwt from "jsonwebtoken";
import config from "../config.js";
import User from "../models/user.model.js";

const userMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "Authentication required: No token provided." });
        }
        const decoded = jwt.verify(token, config.JWT_USER_PASSWORD);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Authentication failed: User not found." });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("User middleware error:", error);
        return res.status(401).json({ message: "Authentication failed: Invalid or expired token." });
    }
};

export default userMiddleware;