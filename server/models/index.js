'use strict';
require('dotenv').config();
var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
const env     = process.env.NODE_ENV || 'development';
const config  = require(__dirname + '/../config/config.js')[env];
var db        = {};
var sequelize = new Sequelize(config.database, config.username, config.password, {host: config.host, dialect: config.dialect});
// var sequelize = new Sequelize("postgres://ybvebvqdkdquto:89578c33ad08094da9dccd0cf7d01d5744d53420695b83e88d81896b883e7d1d@ec2-50-17-203-51.compute-1.amazonaws.com:5432/dt9ck2qfe2esh",{
//   dialect:  config.dialect,
//   protocol: 'postgres',
//   port:     5432,
//   host:     config.host,
//
//   logging:  true //false
// });

sequelize.authenticate().then(function(){
    console.log("Connection has been established successfully to " + env + " environment.");
}).catch(function(err) {
    console.log('Unable to connect to the ' + env + ' database:'+ JSON.stringify(err , null , 2));
});

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;