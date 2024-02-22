const { empData } = require('../globals');

exports.getEmpData = async (req, res, next) => res.json(empData);
