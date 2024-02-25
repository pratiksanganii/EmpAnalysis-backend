const prisma = require('../../prisma');
const { HTTPError } = require('../error');
const { chartTypes, empData } = require('../globals');

exports.create = async (req, res, next) => {
  try {
    const data = await validatePayload(req, 'create');
    const chart = await prisma.chart.create({ data });
    return res.json(chart);
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const data = await validatePayload(req, 'update');
    const update = await prisma.chart.update({ where: { id: body?.id }, data });
    return res.json(update);
  } catch (e) {
    next(e);
  }
};
exports.delete = async (req, res, next) => {
  try {
    const body = req?.body;
    const data = await validatePayload(req, 'delete');
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
      select: { id: true, type: true, field: true },
    });
    if (data.length) await getChartData(data, userId);
    return res.json(data);
  } catch (e) {
    next(e);
  }
};

exports.getTypes = (req, res) => {
  return res.json(chartTypes);
};

async function validatePayload(req, type) {
  const userId = req.userId;
  const body = req.body;
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

async function getChartData(data, userId) {
  const fields = Array.from(new Set(data.map((d) => d.field)));
  const where = { userId };
  const select = {};
  fields.forEach((f) => (select[f] = true));
  const empData = await prisma.employee.findMany({ where, select });
  data.forEach((chart) => {
    if (chart.field == 'skills') getSkillChartData(chart, empData);
    else {
      const types = empData.map((e) => e[chart['field']]);
      getCommonChartData(chart, types);
    }
  });
}

function getSkillChartData(chart, emp) {
  const skills = emp.flatMap((e) => e.skills);
  getCommonChartData(chart, skills);
}

function getCommonChartData(chart, data) {
  const tempObj = {};
  data.forEach((sk) => {
    if (tempObj[sk]) tempObj[sk]++;
    else tempObj[sk] = 1;
  });
  chart.types = [];
  chart.values = [];
  Object.keys(tempObj).map((k) => {
    chart.types.push(k);
    chart.values.push(tempObj[k]);
  });
}
