const Admin      = require('../models').Admin;
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
var env       = process.env.NODE_ENV || 'production';
var config    = require('../config/config.js')[env];
var secret    = config.secret;
const db      = require('../config/db.js');

function verifyJwtToken(req , res , next){
    req.db    = db;
    if(req.headers && req.headers.authorization)
    {
        jwt.verify(req.headers.authorization,secret,function(err,decode){
            if(err) {
                req.user = undefined;
                next();
            }else {
                Admin.findOne({where: {email: decode.email, id: decode.id}}).then(function (admin) {
                    if (!admin) {
                        req.user = undefined;
                        next();
                    } else {
                        req.user = admin;
                        next();
                    }
                }).catch(function (err) {
                    req.user = undefined;
                    next();
                });
            }
        });
    }
    else{
        req.user = undefined;
        next();
    }
}

function isAuthenticated(req, res, next) {
    if (req.user) {
        next();
    } else {
        return res.status(401).json({ success: false , message: 'Unauthorized user!' });
    }
}

module.exports = {

    verifyJwtToken: verifyJwtToken,
    isAuthenticated: isAuthenticated
};