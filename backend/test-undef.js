const express = require('express');
const app = express();
app.get('/test', (req,res,next) => { console.log('Hit test mid'); next(); }, undefined);
app.listen(5003, () => {
  require('http').get('http://localhost:5003/test', (res) => {
    console.log('Status:', res.statusCode);
    process.exit(0);
  });
})
