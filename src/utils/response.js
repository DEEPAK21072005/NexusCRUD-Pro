import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

export const sendSuccess = (res, {
  statusCode = HTTP_STATUS.OK,
  message = 'Success',
  data = null,
  meta = null,
}) => {
  const payload = {
    status: 'success',
    statusCode,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, {
    statusCode: HTTP_STATUS.CREATED,
    message,
    data,
  });
};

export const sendNoContent = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};
