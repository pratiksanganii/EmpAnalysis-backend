const prisma = require('../../prisma');
const { HTTPError } = require('../error');
const { chartTypes } = require('../globals');

exports.create = async (req, res, next) => {
  try {
    const data = await validatePayload(req);
    const chart = await prisma.chart.create({ data });
    return res.json(chart);
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const data = await validatePayload(req);
    const update = await prisma.chart.update({ where: { id: body?.id }, data });
    return res.json(update);
  } catch (e) {
    next(e);
  }
};
exports.delete = async (req, res, next) => {
  try {
    const body = req?.body;
    const data = await validatePayload(body);
    const update = await prisma.chart.update({ where: { id: body?.id }, data });
    return res.json(update);
  } catch (e) {
    next(e);
  }
};
exports.data = async (req, res, next) => {
  try {
    const userId = req?.userId;
    const data = await prisma.chart.findMany({
      where: { userId, isDeleted: false },
    });
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.getTypes = (req,res)=>{
  return res.json(chartTypes)
}

async function validatePayload(body, type) {
  if (!userId) throw new HTTPError({ statusCode: 401 });
  if (['delete', 'update'].includes(type)) {
    if (!body?.id) throw new HTTPError({ param: 'id' });
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
