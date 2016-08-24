// ========== Package import ==========
const express = require('express');
const app = express();

// =========== app setup ===========
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// =========== app startup ===========
app.listen(process.env.PORT || 8080, () => {
  console.log('Example app listening on port 8080!');
});
