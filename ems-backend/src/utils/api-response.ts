export const successResponse = (
  res: any,
  message: string,
  data = null,
  statusCode = 200
) => {

  return res.status(statusCode)
  .json({
    success: true,
    message,
    data
  });

};