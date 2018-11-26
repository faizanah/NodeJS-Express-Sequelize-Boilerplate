const Admin      = require('../models').Admin;
const bcrypt     = require('bcrypt');
const salt       = bcrypt.genSaltSync(10);
var async        = require('async');
const crypto     = require('crypto');
const db         = require('../config/db');
const mailer     = require('../config/mailer');
var params       = {tableName: 'Admin' , body: {}};

function create(req,res) {
    req.checkBody("email" , 'Enter a valid email address.').isEmail();

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
                params.body = {where: {email: req.body.email, status: 'pending'}};
                db.retrieve(req, res, params, function (data) {
                    if (!data)
                        return db.sendError({code: 422, message: 'Invalid email or already ob-board.'}, res);
                    data.updateAttributes({
                        invitation_token: token,
                        invitation_token_expires: Date.now() + 3600000
                    }).then(function (result) {
                        console.log(JSON.stringify(result, null, 2));
                        done(null, token, result);
                    }).catch(function (error) {
                        console.log(JSON.stringify(error, null, 2));
                        done(error);
                    });
                });
            },
            function (token, user, done) {
                var mailOptions = {
                    to: user.email,
                    subject: 'SEISMIC Invitation',
                    text: "Your account won't be created until you access the link below and set your password\n\n" +
                    'http://' + req.headers.host + '/users/invitations/' + user.invitation_token + '\n\n' +
                    "If you don't want to accept the invitation, please ignore this email.\n"
                };
                mailer.sendMail(mailOptions, function (err) {
                    if (err)
                        return db.sendError(err, res);
                    return res.status(200).json({success: true, message: 'An invitation e-mail has been sent.'});
                });
            }
        ], function (err) {
            done(err);
        });
    }
}

function retrieve(req , res) {
    req.checkParams("token", "Invalid token.").isLength({ min: 10 });

    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else {
        params.body = {where: {invitation_token: req.params.token, invitation_token_expires: {$gt: Date.now()}}};
        db.retrieve(req, res, params, function (data) {
            if (!data)
                return db.sendError({code: 422, message: 'Invitation token is invalid or has expired.'}, res);
            return res.status(200).send({success: true, data: data});
        });
    }
}
function generateInvitationLink(req , res) {

    req.checkParams("id", "Invalid user id.").notEmpty().isInt();

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
                params.body = {where: {id: req.params.id}};
                db.retrieve(req, res, params, function (data) {
                    if (!data)
                        return db.sendError({code: 404, message: 'Invalid Request. User not found.'}, res);
                    if (data.isOnboard())
                        return db.sendError({code: 422, message: 'Already Onboard.'}, res);
                    data.updateAttributes({
                        invitation_token: token,
                        invitation_token_expires: Date.now() + 3600000
                    }).then(function (result) {
                        console.log(JSON.stringify(result, null, 2));
                        // if(true) For sending invitation email
                        // done(null, token, result);
                        res.status(201).send({
                            success: true,
                            data: {
                                token: result.invitation_token,
                                link: 'http://' + req.headers.host + '/authentication/invitation/' + result.invitation_token,
                                expired_at: result.invitation_token_expires,
                                is_expired: result.invitation_token_expires < Date.now()
                            }
                        });
                    }).catch(function (error) {
                        console.log(JSON.stringify(error, null, 2));
                        done(error);
                    });
                });
            },
            function (token, user, done) {
                var mailOptions = {
                    to: user.email,
                    subject: 'SEISMIC Invitation',
                    text: "Your account won't be created until you access the link below and set your password\n\n" +
                    'http://' + req.headers.host + '/users/invitations/' + user.invitation_token + '\n\n' +
                    "If you don't want to accept the invitation, please ignore this email.\n"
                };
                mailer.sendMail(mailOptions, function (err) {
                    if (err)
                        return db.sendError(err, res);
                    return res.status(200).json({success: true, message: 'An invitation e-mail has been sent.'});
                });
            }
        ], function (err) {
            done(err);
        });
    }
}

function verifyInvitationToken(req , res){

    req.checkParams("token", "Invalid token.").isLength({ min: 10 });
    req.checkBody("first_name", "First Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("last_name", "Last Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("gender", "Invalid user Gender.").optional().isIn(['M', 'F']);
    req.checkBody("profile_pic_url", "Invalid url.").optional().isURL();
    req.checkBody("password", "Password should be at least 6 chars long").isLength({ min: 6 });

    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else {
        const admin = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            user_mode: req.body.user_mode,
            location: req.body.location,
            gender: req.body.gender,
            profile_pic_url: req.body.profile_pic_url,
            birth_date: req.body.birth_date,
            password: bcrypt.hashSync(req.body.password, salt, null),
            status: 'accepted',
            invitation_token: undefined,
            invitation_token_expires: undefined
        };
        async.waterfall([
            function (done) {
                params.body = {
                    where: {
                        invitation_token: req.params.token,
                        invitation_token_expires: {$gt: Date.now()}
                    }
                };
                db.retrieve(req, res, params, function (data) {
                    if (!data)
                        return db.sendError({code: 422, message: 'Invitation token is invalid or has expired.'}, res);
                    data.updateAttributes(admin).then(function (result) {
                        if (!result)
                            return db.notFound(res);
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
                    subject: 'Welcome To SEISMIC',
                    text: 'Hello, ' + user.first_name + '\n\n' +
                    'Welcome to SEISMIC! Thanks so much for joining us.\n'
                };
                mailer.sendMail(mailOptions, function (err) {
                    return res.status(200).send({success: true, message: 'Successfully On-board'});
                });
            }
        ], function (err) {
            done(err);
        });
    }
}

module.exports = {
    verifyInvitationToken: verifyInvitationToken,
    retrieve:retrieve,
    create: create,
    generateInvitationLink: generateInvitationLink
};