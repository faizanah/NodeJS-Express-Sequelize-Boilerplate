const express        = require('express');
const logger         = require('morgan');
const bodyParser     = require('body-parser');
var expressValidator = require('express-validator');

const cors           = require('cors');
const methodOverride = require('method-override');
const compression    = require("compression");
const authHelper     = require("./server/helpers/authhelper");
const controllers    = require('./server/controllers');

const app = express();
app.use(compression());
app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(expressValidator());
app.use(authHelper.verifyJwtToken);

// Require our routes into the application.
require('./server/routes')(app , controllers);

module.exports = app;