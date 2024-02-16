const { verify } = require('jsonwebtoken');
const { HTTPError } = require('./error');
const { JWT_SECRET } = require('../config');

exports.authUser = async function (req, res, next) {
  try {
    const token = req?.headers?.accessToken;
    const user = verify(token, JWT_SECRET);
    if (req?.body) req.body.user = user;
    else req.query.user = user;
    next();
  } catch (e) {
    throw new HTTPError({ message: 'Authentication failed!', statusCode: 403 });
  }
};
