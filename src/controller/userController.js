const { JWT_SECRET } = require('../../config');
const prisma = require('../../prisma');
const { HTTPError } = require('../error');
const { compareSync, hashSync } = require('bcrypt');
const { sign } = require('jsonwebtoken');

exports.login = async function (req, res, next) {
  try {
    const data = await validatePayload(req.body, false);
    return res.json({ data, message: 'Logged In' });
  } catch (e) {
    next(e);
  }
};
exports.signup = async function (req, res, next) {
  try {
    const data = await validatePayload(req.body, true);
    const create = await prisma.user.create({ data });
    const accessToken = getToken(create);
    create.accessToken = accessToken;
    delete create?.password;
    return res.json({
      data: create,
      accessToken,
      message: 'User profile created.',
    });
  } catch (e) {
    next(e);
  }
};

async function validatePayload(payload, isSignUp) {
  // verify email
  const email = payload?.email;
  const emailRegex = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/g;
  if (!email || typeof email !== 'string' || !emailRegex.test(email))
    throw HTTPError({ param: 'Email' });

  // verify password
  let password = payload?.password;
  const passRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!password || typeof password !== 'string' || !passRegex.test(password))
    throw HTTPError({ param: 'Password' });

  // validate name
  const name = payload?.name;
  if (isSignUp) {
    if (!name || typeof name != 'string' || name?.length < 3)
      throw new HTTPError({ param: 'Name' });
  }

  // find user by email
  const user = await prisma.user.findFirst({
    where: { email },
    select: { email: true, password: true, id: true, name: true },
  });

  if (isSignUp)
    if (user)
      // if trying to signup with existing registered email
      throw new HTTPError({
        message: 'That email is already in use.',
        statusCode: 400,
      });
    else return { name, email, password: hashSync(password, 10) };

  // verify password for login
  if (!user) throw new HTTPError({ message: 'Wrong Credentials' });
  const compare = compareSync(password, user.password);
  if (!compare) throw new HTTPError({ message: 'Wrong Credentials' });
  const accessToken = getToken(user);
  delete user?.password;
  return { accessToken, user };
}

function getToken(user) {
  return sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '2 days',
  });
}
