import { EventEmitter } from "node:events";
import { emailEventEnum } from "../enum/emailEventEnum.js";
import { sendEmail } from "../service/mailService.js";
import { sendEmailTemplate } from "../template/senEmail.js";
export const emailEvent = new EventEmitter();

emailEvent.on(emailEventEnum.SINGUP, async (data) => {
  try {
    await sendEmail({
      ...data,
      subject: "Welcome to Saraha",
      html: sendEmailTemplate({ ...data }),
    });
  } catch (error) {
    console.error(error);
  }
});
