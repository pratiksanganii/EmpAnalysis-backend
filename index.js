const express = require('express');
const router = require('./src/routes');
const { errorHandler } = require('./src/error');
const { PORT } = require('./config');

function initializeApp() {
  try {
    const app = express();
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
