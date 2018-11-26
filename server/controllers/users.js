var async        = require('async');
const crypto     = require('crypto');
const bcrypt     = require('bcrypt');
const shortid    = require('shortid');
const salt       = bcrypt.genSaltSync(10);
const db         = require('../config/db');
var params       = {tableName: 'User' , body: {}};
const mailer     = require('../config/mailer');

function create(req, res) {
    req.checkBody("email").isEmail().withMessage('Enter a valid email address.').trim().normalizeEmail().custom(function(value){
        return db.models[params.tableName].findOne({where: {email: value}}).then(function(admin) {
            console.log(JSON.stringify(admin , null , 2));
            throw new Error('this email is already in use');
        })
    });
    req.checkBody("role" , "Invalid user role.").isIn(['user', 'admin' , 'support']);
    req.checkBody("first_name", "First Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("last_name", "Last Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("gender", "Invalid user Gender.").optional().isIn(['M', 'F']);
    req.checkBody("profile_pic_url", "Invalid url.").optional().isURL();


    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else{
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                params.body = {
                    role: req.body.role,
                    first_name: req.body.first_name,
                    last_name:  req.body.last_name,
                    user_mode: req.body.user_mode,
                    location: req.body.location,
                    gender: req.body.gender,
                    profile_pic_url: req.body.profile_pic_url,
                    birth_date: req.body.birth_date,
                    email: req.body.email,
                    invitation_token: token ,
                    invitation_token_expires: Date.now() + 3600000,
                    password: shortid.generate()

                };
                db.models[params.tableName].create(params.body).then(function (result) {
                    done(null, token, result);
                }).catch(function(error){
                    console.log(JSON.stringify(error , null ,2));
                    done(error);
                });
            },
            function(token, user, done) {
                var  mailOptions = {
                    to: user.email,
                    subject: 'SEISMIC Invitation',
                    text: "Your account won't be created until you access the link below and set your password\n\n" +
                    'http://' + req.headers.host + '/authentication/invitation/' + user.invitation_token + '\n\n' +
                    "If you don't want to accept the invitation, please ignore this email.\n"
                };
                mailer.sendMail(mailOptions, function (err) {
                    if(err)
                        return db.sendError(err,res);
                    res.status(201).send({status: 201 , success: true ,message: 'An invitation e-mail has been sent.'});
                });
            }
        ], function(err) {
            if (err)
                return db.sendError(err,res);
        });
    }
}

function update(req,res) {
    req.checkBody("first_name", "First Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("last_name", "Last Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("gender", "Invalid user Gender.").optional().isIn(['M', 'F']);
    req.checkBody("profile_pic_url", "Invalid url.").optional().isURL();
    req.checkParams("id", "Invalid user id.").notEmpty().isInt();
    params.condition = {where: { id: req.params.id} };
    params.body = {
        first_name: req.body.first_name,
        last_name:  req.body.last_name,
        user_mode: req.body.user_mode,
        location: req.body.location,
        gender: req.body.gender,
        profile_pic_url: req.body.profile_pic_url,
        birth_date: req.body.birth_date
    };
    if(req.user.isAdmin()){
        params.body.role = req.body.role;
        req.checkBody("role" , "Invalid user role.").isIn(['user', 'admin' , 'support']);
    }
    return db.update(req , res , params);
}

function list(req , res){
    params.body = {where: {$not: [{id: req.user.id}]}};
    return db.list(req , res , params);
}

function retrieve(req , res) {
    req.checkParams("id", "Invalid user id.").notEmpty().isInt();
    params.body = {where: {id: req.params.id}};
    return db.retrieve(req , res , params);
}

function destroy(req , res) {
    req.checkParams("id", "Invalid user id.").notEmpty().isInt();
    params.condition = {where: {id: req.params.id}};
    return db.destroy(req , res , params);
}

function changePassword(req , res) {
    req.checkBody("current_password", "Current Password should be at least 6 chars long").isLength({ min: 6 });
    req.checkBody("new_password", "New Password should be at least 6 chars long").isLength({ min: 6 });
    req.checkBody("confirm_password", "Confirm Password should be at least 6 chars long").isLength({ min: 6 });

    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else {
        var data = {
            currentPassword: req.body.current_password,
            newPassword: req.body.new_password,
            confirmPassword: req.body.confirm_password
        };
        if (data.newPassword == data.confirmPassword) {
            if (req.user.authenticate(data.currentPassword)) {
                req.user.updateAttributes({password: bcrypt.hashSync(data.newPassword, salt, null)}).then(function (result) {
                    return res.status(200).send({success: true, message: "Password successfully changed."});
                }).catch(function (error) {
                    console.log(JSON.stringify(error, null, 2));
                    db.sendError(error, res)
                });
            } else {
                return db.sendError({code: 422, message: 'Current password does not match.'}, res);
            }
        } else {
            db.sendError({message: 'Confirm password does not match'}, res)
        }
    }

}

function profile(req , res){
    req.checkBody("first_name", "First Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("last_name", "Last Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("gender", "Invalid user Gender.").optional().isIn(['M', 'F']);
    req.checkBody("profile_pic_url", "Invalid url.").optional().isURL();
    if(errors = req.validationErrors())
        db.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else {
        params.body = {
            first_name: req.body.first_name || req.user.first_name,
            last_name: req.body.last_name || req.user.last_name,
            user_mode: req.body.user_mode || req.user.user_mode,
            location: req.body.location || req.user.location,
            gender: req.body.gender || req.user.gender,
            profile_pic_url: req.body.profile_pic_url || req.user.profile_pic_url,
            birth_date: req.body.birth_date || req.user.birth_date
        };

        req.user.updateAttributes(params.body).then(function (result) {
            if (!result) {
                return db.notFound(result);
            }
            return res.status(200).send({success: true, data: result, message: "Successfully Updated."});
        }).catch(function (error) {
            console.log(JSON.stringify(error, null, 2));
            db.sendError(error, res)
        });
    }
}

module.exports = {
    create: create,
    list: list,
    retrieve: retrieve,
    update:update,
    destroy: destroy,
    changePassword: changePassword,
    profile: profile
};
