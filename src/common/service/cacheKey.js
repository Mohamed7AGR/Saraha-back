export const userKeyBase = ({ userId }) => {
  return `user::${userId}`;
};
export const userRevokeKey = ({ userId, jti }) => {
  return `${userKeyBase({ userId })}::revoke::${jti}`;
};
export const otpKey = ({ userId }) => {
  return `${userKeyBase({ userId })}::otp`;
};