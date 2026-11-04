import jwt from "jsonwebtoken";

export const generateRefreshToken = (userId, sessionId) => {
  const refreshToken = jwt.sign(
    { userId, sessionId, type: "refresh" },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    { expiresIn: "15d" },
  );
  return refreshToken;
};

export const generateAccessToken = (userId, sessionId) => {
  const accessToken = jwt.sign(
    { userId, sessionId, type: "access" },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    { expiresIn: "15m" },
  );
  return accessToken;
};

export const generateNewRefreshToken = (userId, sessionId, expiresAt) => {
  const refreshToken = jwt.sign(
    { userId, sessionId, type: "refresh" },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    { expiresIn: expiresAt },
  );
  return refreshToken;
};

export const generateNewAccessToken = (userId, sessionId, expiresIn) => {
  const accessToken = jwt.sign(
    { userId, sessionId, type: "access" },
    process.env.JWT_SECRET_ACCESS_TOKEN,
    { expiresIn: expiresIn },
  );
  return accessToken;
};
