import messageRepo from "../../db/repo/message.repo.js";
import userRepo from "../../db/repo/user.repo.js";
import { notFoundExeption } from "../../common/index.js";




//create message
export const createMessage = async ({ receverId, content }, attachments, user,t) => {
  let receiver = await userRepo.findById({ id: receverId });
  if (!receiver) notFoundExeption(t("user.notFound"));
  let message = await messageRepo.create({
    data: {
      receverId,
      ...(content ? { content } : {}),
      ...(user?._id ? { senderId: user._id } : {}),
      ...(attachments.length > 0
        ? { attachments: attachments.map((file) => file.path) }
        : {}),
    },
  });
  return message;
};
