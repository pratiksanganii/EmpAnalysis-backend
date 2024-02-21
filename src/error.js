exports.HTTPError = function ({ message, statusCode, param }) {
  message = message ?? 'Internal Error';
  statusCode = statusCode ?? 500;
  if (param) {
    statusCode = 400;
    message = `Provide valid ${param}`;
  }
  const str = JSON.stringify({ message, statusCode });
  return new Error(str);
};

exports.errorHandler = (err, req, res, next) => {
  try {
    const data = JSON.parse(err?.message);
    if (data.statusCode) res.statusCode = data.statusCode;
    return res.json(data);
  } catch (e) {
    res.statusCode = 500;
    return res.json({ message: 'Internal Error' });
  }
};
