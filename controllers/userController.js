import randomBytes from "randombytes";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { sendVerifyEmail } from "../controllers/sendEmail.js";
import { jwtDecode } from "jwt-decode";

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
  console.log(randomVerifyToken);
  res.cookie("verify_account", randomVerifyToken, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
    secure: false,
  });

  const user = await User.findOne({ email });
  await User.findByIdAndUpdate(user._id, { verifyToken: randomVerifyToken });

  await sendVerifyEmail(email, firstName, randomVerifyToken);
  res.json({
    message: "User created successfully, please verify your email",
    token: randomVerifyToken,
  });
});

export const verifyAccount = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const writeToken = req.cookies.verify_account;
  console.log(writeToken);
  if (!writeToken) throw new Error("invalid link");
  if (token !== writeToken) {
    throw new Error("Invalid Link");
  }

  const user = await User.findOne({ verifyToken: token });
  if (!user) throw new Error("you must register first");
  user.isVerifyToken = true;
  user.verifyAccount = undefined;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Email is verified successfully" });
});

// log-in

export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const userFound = await User.findOne({ email });
  if (userFound && (await userFound.isPasswordMatched(password))) {
    if (!userFound.isVerifyToken) {
      console.log("verify");
      const randomVerifyToken = randomBytes(16).toString("hex");
      const verifyToken = jwt.sign(
        { email, randomVerifyToken },
        process.env.VERIFY_TOKEN_ACCOUNT,
        { expiresIn: "15m" }
      );
      res.cookie("verify_Account", verifyToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        secure: false,
      });
      await sendVerifyEmail(email, userFound.firstName, randomVerifyToken);
      throw new Error("You must verify your account");
    }
    const {
      _id: userId,
      firstName,
      lastName,
      isVerifyToken,
      isAdmin,
    } = userFound;
    const accessToken = jwt.sign(
      { userId, firstName, lastName, isVerifyToken, isAdmin },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { userId, firstName, lastName, isVerifyToken, isAdmin },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "45s" }
    );
    await User.findByIdAndUpdate(userId, { access_token: accessToken });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
    });
    const decode = jwtDecode(refreshToken);
    const userInfo = {
      firstName: decode.firstName,
      lastName: decode.lastName,
    };
    res.json({
      message: "You are successfully logged in",
      token: refreshToken,
      userInfo: userInfo,
    });
  } else {
    throw new Error("Invalid email or password");
  }
});
