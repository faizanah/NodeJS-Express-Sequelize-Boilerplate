// This will be our application entry. We'll setup our server here.
require('dotenv').config();
const http = require('http');
const app = require('../app'); // The express app we just created

const port = parseInt(process.env.PORT) || 8080;
const host = process.env.HOST || '0.0.0.0';
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
console.log("Running on http://"+host+":"+port);