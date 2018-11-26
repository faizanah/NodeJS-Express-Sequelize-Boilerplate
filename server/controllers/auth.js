const User      = require('../models').User;
const bcrypt     = require('bcrypt');
const salt       = bcrypt.genSaltSync(10);
const async      = require('async');
const crypto     = require('crypto');
const env        = process.env.NODE_ENV || 'development';
const config     = require('../config/config.js')[env];
const version    = config.version;
const db         = require('../config/db');
const mailer     = require('../config/mailer');
var params       = {tableName: 'User' , body: {}};

function reset(req,res , next) {
    req.checkBody("email", "Enter a valid email address.").isEmail().isLength({ min: 3 , max: 100 });
    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else {
        async.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                params.body = {where: {email: req.body.email}};
                db.retrieve(req, res, params, function (data) {
                    if (!data)
                        return db.sendError({code: 404, message: 'No account with that email address exists.'}, res);
                    data.updateAttributes({
                        reset_password_token: token,
                        reset_password_expires: Date.now() + 3600000
                    }).then(function (result) {
                        done(null, token, result);
                    }).catch(function (error) {
                        return db.sendError(error, res);
                    });
                });
            },
            function (token, user, done) {
                var mailOptions = {
                    to: user.email,
                    subject: 'Password Reset',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + 'Place Your frontend link here' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                mailer.sendMail(mailOptions, function (err) {
                    if (err)
                        return db.sendError(err, res);
                    return res.status(200).json({success: true, message: 'An e-mail has been sent.'});
                });
            }
        ], function (err) {
            if (err)
                return db.sendError(err, res);
        });
    }
}

function verifyResetToken(req , res) {
    req.checkParams("token", "Invalid Token.").isLength({ min: 3 , max: 100 });
    req.checkBody("password", "Password should be at least 6 chars long.").isLength({ min: 6 });
    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else {
        async.waterfall([
            function (done) {
                params.body = {where: {reset_password_token: req.params.token, reset_password_expires: {$gt: Date.now()}}};
                db.retrieve(req, res, params, function (data) {
                    if (!data)
                        return db.sendError({code: 422, message: 'Password reset token is invalid or has expired.'}, res);
                    data.updateAttributes({
                        password: bcrypt.hashSync(req.body.password, salt, null),
                        reset_password_token: undefined,
                        reset_password_expires: undefined
                    }).then(function (result) {
                        done(null, result);
                    }).catch(function (error) {
                        console.log(JSON.stringify(error, null, 2));
                        done(error);
                    });
                });
            },
            function (user, done) {

                var mailOptions = {
                    to: user.email,
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                mailer.sendMail(mailOptions, function (err) {
                    return res.status(200).send({success: true, message: 'Your password has been successfully changed.'});
                });
            }
        ], function (err) {
            done(err);
        });
    }
}

function login(req, res) {

    req.checkBody("email", "Enter a valid email address.").isEmail().isLength({ min: 3 , max: 100 });
    req.checkBody("password", "Password should be at least 6 chars long.").isLength({ min: 6 });
    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else {
        const email     = req.body.email;
        const password  = req.body.password;
        User.findOne({where: {email: email}}).then(function (user) {
            if (!user) {
                return db.sendError({code: 404, message: 'Authentication failed. User not exist.'}, res)
            } else {
                if (user.authenticate(password)) {
                    return res.status(200).send({
                        success: true,
                        data: user,
                        token: user.generateJwtToken(),
                        message: "Successfully login."
                    });
                }
                return db.sendError({code: 401, message: 'Authentication failed. Wrong Password.'}, res);
            }
        }).catch(function (err) {
            return db.sendError(err, res);
        });
    }
}

function signup(req, res) {

  req.checkBody("email", "Enter a valid email address.").isEmail().isLength({ min: 3 , max: 100 });
  req.checkBody("first_name", "First Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
  req.checkBody("first_name", "Last Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
  req.checkBody("password", "Password should be at least 6 chars long.").isLength({ min: 6 });
  req.checkBody("role", "Role can't be blank.").isLength({ min: 3 });
  console.log(JSON.stringify(req.body, null, 2));
  params.body = {
    first_name: req.body.first_name,
    last_name: req.body.first_name,
    password: req.body.password,
    email: req.body.email,
    role: req.body.role
  };
  return req.db.create(req , res , params);
}

function logout(req , res)
{
    res.status(200).send({message: 'You are on the logout page'});
}
module.exports = {
    login: login,
    signup: signup,
    logout: logout,
    reset: reset,
    verifyResetToken: verifyResetToken
};