import randomBytes from "randombytes";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { sendVerifyEmail } from "../controllers/sendEmail.js";
export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400).json({ message: "User already exists" });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ message: "Password does not match" });
    return;
  }
  await User.create({ firstName, lastName, email, password });
  const randomVerifyToken = randomBytes(16).toString("hex");
  const verifyAccountToken = jwt.sign(
    { email, randomVerifyToken },
    process.env.VERIFY_TOKEN_ACCOUNT,
    { expiresIn: "10m" }
  );
  res.cookie("verify_account", verifyAccountToken, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    secure: false,
  });
  await sendVerifyEmail(email, firstName, randomVerifyToken);
  res.json({
    message: "User created successfully, please verify your email",
    token: randomVerifyToken,
  });
});