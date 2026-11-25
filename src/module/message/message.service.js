import messageRepo from "../../db/repo/message.repo.js";
import userRepo from "../../db/repo/user.repo.js";
import { notFoundExeption } from "../../common/index.js";
import { filterTypeEnum } from "../../common/enum/index.js";

//create message
export const createMessage = async (
  { receverId, content },
  attachments,
  user,
  t,
) => {
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

//getMessages
export const getMessages = async (user, { limit, page, type }, t) => {
  let filter = {};
  switch (type) {
    case filterTypeEnum.SEND:
      filter = { senderId: user._id };
      break;
    case filterTypeEnum.RECEIVE:
      filter = { receverId: user._id };
      break;
    case filterTypeEnum.ALL:
      filter = { $or: [{ senderId: user._id }, { receverId: user._id }] };
      break;
    default:
      notFoundExeption(t("filterType.notFound"));
  }
  let messages = await messageRepo.pagination({
    filter,
    page,
    limit,
  });
  if (!messages.count) {
    notFoundExeption(t("messages.notFound"));
  }

  return messages;
};
//delete message
export const deleteMessage = async (user, { messageId }, t) => {
  let deletedMessage = await messageRepo.findOneAndDelete({
    filter: { _id: messageId, receverId: user._id },
  });
  if (!deletedMessage) notFoundExeption(t("message.notFound"));
  return deletedMessage;
};
