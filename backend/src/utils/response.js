export const sendSuccess = (res, statusCode, message, data = null) => {
  const payload = { success: true, message };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
};

export const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};
