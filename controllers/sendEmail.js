import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "behdadkindle@gmail.com",
    pass: process.env.PASSWORD_EMAIL,
  },
});
export const sendVerifyEmail = async (email, firstName, verifyToken) => {
  try {
    const mailOptions = {
      from: "behdadkindle@gmail.com",
      to: email,
      subject: "Email Verification",
      html: `
      <div class="font-sans bg-gray-200 p-8 rounded-lg">
      <div class="flex gap-8 justify-between">
          <p>Dear ${firstName},</p>
          <img src="https://th.bing.com/th/id/OIP.cneIxMB7ie6Q1JkJoLB5zwHaE2?w=279&h=183&c=7&r=0&o=5&dpr=1.3&pid=1.7" alt="brand" class="w-10 h-10" />
      </div>
      <h1 class="text-gray-800 text-2xl font-bold">Click the link below to verify your account</h1>
      <p class="text-gray-600">Please click the link below to verify your account:</p>
      <a href="http://localhost:3600/verify?token=${verifyToken}" class="inline-block px-4 py-2 bg-blue-500 text-white rounded-md no-underline hover:bg-blue-700">Verify Account</a>
  </div>
  
            `,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("Error in sending email: ", error);
    throw error;
  }
};