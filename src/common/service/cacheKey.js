export const userKeyBase = ({ userId }) => {
  return `user::${userId}`;
};
export const userRevokeKey = ({ userId, jti }) => {
  return `${userKeyBase({ userId })}::revoke::${jti}`;
};
export const otpKey = ({ userId }) => {
  return `${userKeyBase({ userId })}::otp`;
};
export const subjectOtpKey = ({ userId,subject }) => {
  return `${otpKey({ userId })}::${subject}`;
};
export const otpTrailsKey = ({ userId,subject }) => {
  return `${subjectOtpKey({userId,subject})}::trails`;
};
export const wrongOtpKey = ({ userId,subject }) => {
  return `${otpTrailsKey({userId,subject})}::wrong`;
};

export const otpBlockedKey = ({ userId,subject }) => {
  return `${subjectOtpKey({userId,subject})}::blocked`;
};



