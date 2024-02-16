const { config } = require('dotenv');
config();

exports.PORT = process.env.PORT ?? 5000;
exports.JWT_SECRET = process.env.JWT_SECRET;
