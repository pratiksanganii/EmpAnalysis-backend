const { JWT_SECRET } = require('../../config');
const prisma = require('../../prisma');
const { HTTPError } = require('../error');
const { compareSync, hashSync } = require('bcrypt');
const { sign } = require('jsonwebtoken');
const { Workbook } = require('exceljs');
const { writeFileSync } = require('fs');

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
  return { accessToken, ...user };
}

function getToken(user) {
  return sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: '2 days',
  });
}

exports.upload = async (req, res, next) => {
  try {
    const file = req?.file;
    if (
      !file.originalname.endsWith('.xlsx') &&
      !file.originalname.endsWith('.csv')
    )
      throw new HTTPError({
        message: 'File not valid',
        statusCode: 400,
      });
    const workbook = new Workbook();
    const path = `upload/${new Date().getTime()}.xlsx`;
    writeFileSync(path, file.buffer);
    await workbook.xlsx.readFile(path);
    // get worksheet
    let worksheet = workbook.getWorksheet(1);
    if (!worksheet) worksheet = workbook.getWorksheet();
    const finalizedArray = [];
    const keyArr = [];

    try {
      // Get column names
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        try {
          const columnName = cell.value;
          keyArr[colNumber] = columnName;
        } catch (error) {}
      });

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const rowData = { userId: req.userId };
        try {
          row.eachCell((cell, colNumber) => {
            const columnName = keyArr[colNumber];
            if (columnName == 'employeeID') cell.value = cell.value?.toString();
            else if (['joiningDate', 'birthDate'].includes(columnName))
              cell.value = new Date(cell.value).toDateString();
            if (columnName == 'skills')
              cell.value = cell.value
                .split(',')
                .filter((e) => !(e !== ' ' && !e));
            rowData[columnName] = cell.value;
          });

          finalizedArray.push(rowData);
        } catch (error) {}
      }
    } catch (e) {}
    await prisma.employee.createMany({ data: finalizedArray });
    return res.json(finalizedArray);
  } catch (e) {
    console.log({ e });
    next(e);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({ where: { id: req.userId } });
    delete user?.password;
    return res.json(user);
  } catch (e) {
    throw new HTTPError({});
  }
};
