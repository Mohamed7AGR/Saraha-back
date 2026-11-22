import { arMessage } from "./ar.js";
import { enMessage } from "./en.js";
import { langEnum } from "../common/enum/index.js";

const messages = {
  [langEnum.arabic]: arMessage,
  [langEnum.english]: enMessage,
};

export const getMessage = (lang, key) => {
  const dict = messages[lang] || messages[langEnum.english];
  return dict[key] || messages[langEnum.english][key] || key;
};