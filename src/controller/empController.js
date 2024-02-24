const { HTTPError } = require('../error');
const prisma = require('../../prisma');
const { empData } = require('../globals');

exports.create = async (req, res, next) => {
  try {
    const data = await checkPayload(req.body, 'create', req.userId);
    const emp = await prisma.employee.create({ data });
    return res.json({ message: 'Employee added.', emp });
  } catch (e) {
    next(e);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await checkPayload(req.body, 'update', req.userId);
    const emp = await prisma.employee.update({
      where: { id: req.body.id },
      data,
    });
    return res.json({ message: 'Employee updated.', emp });
  } catch (e) {
    next(e);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const data = await checkPayload(req.body, 'delete', req.userId);
    const emp = await prisma.employee.update({
      where: { id: req.body.id },
      data,
    });
    return res.json({ message: 'Employee deleted.', emp });
  } catch (e) {
    next(e);
  }
};

exports.list = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new HTTPError({ param: 'userId' });
    const data = await prisma.employee.findMany({
      where: { userId, isDeleted: false },
    });
    data.forEach((d) => {
      d.skills = d.skills.join(',');
      if (d.birthDate) d.birthDate = new Date(d.birthDate).toLocaleDateString();
      if (d.joiningDate)
        d.joiningDate = new Date(d.joiningDate).toLocaleDateString();
    });
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

async function checkPayload(body, type, userId) {
  const id = body?.id;
  if (!userId) throw new HTTPError({ statusCode: 401 });
  if (['delete', 'update'].includes(type)) {
    if (!id) throw new HTTPError({ param: 'id' });
    const find = await prisma.employee.count({ where: { id, userId } });
    if (!find)
      throw new HTTPError({ message: 'Employee not found.', statusCode: 404 });
    if (type == 'delete') return { isDeleted: true };
  }
  const tempObj = { userId };
  if (body?.employeeID) tempObj['employeeID'] = body?.employeeID;
  if (body?.employeeName) tempObj['employeeName'] = body?.employeeName;
  // validate employee status
  if (body?.employeeStatus)
    if (!empData.status.includes(body?.employeeStatus))
      throw new HTTPError({ param: 'employeeStatus' });
    else tempObj['employeeStatus'] = body?.employeeStatus;

  // validate designation
  if (body?.designation)
    if (!empData.designation.includes(body?.designation))
      throw new HTTPError({ param: 'designation' });
    else tempObj['designation'] = body?.designation;

  if (body?.joiningDate) tempObj['joiningDate'] = body?.joiningDate;
  if (body?.birthDate) tempObj['birthDate'] = body?.birthDate;
  if (body?.skills) tempObj['skills'] = body?.skills?.split(',');
  if (body?.salary) tempObj['salaryDetails'] = body?.salary;
  if (body?.address) tempObj['address'] = body?.address;
  const len = Object.keys(tempObj).length;
  const min = type == 'create' ? 9 : 2;
  if (len < min) throw new HTTPError({ statusCode: 400 });
  return tempObj;
}
