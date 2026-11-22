import nodemailer from 'nodemailer';
import configService from '../../config/config.service.js';
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: configService.EMAIL_USER,
        pass: configService.EMAIL_PASSWORD
    }
});

try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
  } catch (err) {
    console.error("Verification failed:", err);
  }

  export const sendEmail = async ({
    to,
    subject,
    html,
  } = {}) => {
    await transporter.verify();
    const info = await transporter.sendMail({
      from: `Saraha <${configService.EMAIL_USER}> `,
      to,
      subject ,
      html,
    });
    return info;
  };