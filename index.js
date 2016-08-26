// ========== Package import ==========
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

// =========== app setup ===========
app.get('/', (req, res) => {
  res.send('Hello World! and nice to see you');
});

// =========== app startup ===========
app.listen(port, () => {
  console.log('Example app listening on port:' + port);
});
