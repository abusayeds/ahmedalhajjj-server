/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import { Nodemailer_GMAIL, Nodemailer_GMAIL_PASSWORD } from "../../../config";

export const sendEmail = async (otp: any, email: string) => {

  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: Nodemailer_GMAIL,
      pass: Nodemailer_GMAIL_PASSWORD,
    },
  });

  const emailContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; padding: 20px;">
    <h1 style="text-align: center; color: #452778; font-family: 'Times New Roman', Times, serif;">
      Abu<span style="color:black; font-size: 0.9em;">Sayed Server</span>
    </h1>
    <div style="background-color: white; padding: 20px; border-radius: 5px;">
      <h2 style="color:#d3b06c">Hello Dear !</h2>
      <p>You are receiving this email because we received a password reset request for your account.</p>
      <div style="text-align: center; margin: 20px 0;">
        <h3>Your OTP is: <strong>${otp}</strong></h3>
      </div>
      <p>This OTP will expire in 5 minutes.</p>
      <p>If you did not request a password reset, no further action is required.</p>
      <p>Regards,<br>Abu Sayed Server Team</p>
    </div>
    <p style="font-size: 12px; color: #666; margin-top: 10px;">If you're having trouble copying the OTP, please try again.</p>
  </div>
`;


  const receiver = {
    from: "khansourav58@gmail.com",
    to: email,
    subject: "Reset Password OTP",
    html: emailContent,
  };

  await transporter.sendMail(receiver);
}


export const sendRegistationOtpEmail = async (otp: any, email: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: Nodemailer_GMAIL,
      pass: Nodemailer_GMAIL_PASSWORD,
    },
  });

  const emailContent = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
      max-width: 480px; margin: 0 auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <div style="text-align: right;">
      <a href="https://miro.com" target="_blank" style="text-decoration:none; color: #4A4A4A; font-size: 13px; font-weight: 600; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">Go to Miro</a>
    </div>

    <h2 style="font-weight: 700; color: #0d0d0d; margin-top: 10px; margin-bottom: 8px;">Complete registration</h2>
    
    <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 25px;">
      Please enter this confirmation code in the window where you started creating your account:
    </p>
    
    <div style="background-color: #f8f8f8; padding: 20px 0; border-radius: 6px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1a1a1a; margin-bottom: 25px; user-select: all;">
      ${otp}
    </div>

    <p style="font-size: 14px; color: #777777; margin-bottom: 12px;">
      From your mobile device use the code to confirm email.
    </p>

    <p style="font-size: 14px; color: #777777; margin-bottom: 20px;">
      Or click this button to confirm your email:
    </p>

    <p style="font-size: 13px; color: #999999; margin-bottom: 10px;">
      If you didn't create an account in Abu Sayed Server, please ignore this message.
    </p>

    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;" />

    <p style="font-size: 13px; color: #999999; text-align: center;">
      You have received this notification because you have signed up for Abu Sayed Server — endless online solutions for your server needs.
    </p>
  </div>
`;

  const receiver = {
    from: "khansourav58@gmail.com",
    to: email,
    subject: "User Registation OTP ",
    html: emailContent,
  };

  await transporter.sendMail(receiver);
}





















// export const sendRegistationOtpEmail = async (otp: any, email: string) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     secure: true,
//     auth: {
//       user: Nodemailer_GMAIL,
//       pass: Nodemailer_GMAIL_PASSWORD,
//     },
//   });



//   const receiver = {
//     from: "khansourav58@gmail.com",
//     to: email,
//     subject: "Reset Password OTP",
//     html: emailContent,
//   };

//   await transporter.sendMail(receiver);
// }



