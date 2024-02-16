const express = require('express');
const router = require('./src/routes');
const { errorHandler } = require('./src/error');
const { PORT } = require('./config');
const cors = require('cors');

function initializeApp() {
  try {
    const app = express();
    if (process.env.NODE_ENV == 'development') app.use(cors());
    app.use(express.json());
    app.use('/api', router);
    app.use(errorHandler);
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (e) {
    process.exit(1);
  }
}
initializeApp();
