const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./server/config');
const routes = require('./server/routes');

const app = express();
app.use(cors());

// Serve static assets from the client directory
app.use(express.static(path.join(__dirname, 'client')));

// Mount API routes
app.use(routes);

app.listen(config.PORT, () => {
  console.log(`Server running at http://localhost:${config.PORT}`);
});
