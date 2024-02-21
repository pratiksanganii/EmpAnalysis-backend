const { verify } = require('jsonwebtoken');
const { HTTPError } = require('./error');
const { JWT_SECRET } = require('../config');

exports.authUser = async function (req, res, next) {
  try {
    const token = req?.headers?.access_token;
    const user = verify(token, JWT_SECRET);
    req.userId = user.id;
    next();
  } catch (e) {
    throw new HTTPError({ message: 'Authentication failed!', statusCode: 403 });
  }
};
