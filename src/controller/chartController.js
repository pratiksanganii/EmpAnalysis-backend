const prisma = require('../../prisma');
const { HTTPError } = require('../error');

exports.create = async (req, res, next) => {
  try {
    const data = await validatePayload(req);
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const data = await validatePayload(req);
  } catch (e) {
    next(e);
  }
};
exports.delete = async (req, res, next) => {
  try {
  } catch (e) {
    next(e);
  }
};
exports.data = async (req, res, next) => {
  try {
  } catch (e) {
    next(e);
  }
};

async function validatePayload(req, type) {
  const userId = req.userId;
  if (!userId) throw new HTTPError({ statusCode: 401 });
  if (['delete', 'update'].includes(type)) {
    if (!id) throw new HTTPError({ param: 'id' });
    const find = await prisma.chart.count({ where: { id, userId } });
    if (!find)
      throw new HTTPError({ message: 'Employee not found.', statusCode: 404 });
    if (type == 'delete') return { isDeleted: true };
  }
  const tempObj = { userId };
  if (body?.type) tempObj['type'] = body?.type;
  if (body?.field) tempObj['field'] = body?.field;
  const len = Object.keys(tempObj).length;
  const min = type == 'create' ? 3 : 2;
  if (len < min) throw new HTTPError({ statusCode: 400 });
  return tempObj;
}
