import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ msg: "No token provided." });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(403).json({ msg: "Invalid or expired token." });
  }
};

export default authMiddleware;
