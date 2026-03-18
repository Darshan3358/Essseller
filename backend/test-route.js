const express = require('express');
const app = express();
app.use('/api/settings', require('./routes/settingsRoutes'));

app.listen(5002, () => {
  console.log('Test server on 5002');
  const http = require('http');
  http.get('http://localhost:5002/api/settings/carousel', (res) => {
    let rawData = '';
    res.on('data', chunk => { rawData += chunk; });
    res.on('end', () => console.log('Response:', res.statusCode, rawData));
    process.exit(0);
  });
});
