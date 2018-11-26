const bcrypt     = require('bcrypt');
const salt       = bcrypt.genSaltSync(10);
var params       = {tableName: 'User' , body: {}};

function reset(req,res , next) {
    req.checkBody("email", "Enter a valid email address.").isEmail().isLength({ min: 3 , max: 100 });
      params.body = {where: {email: req.body.email}};
      req.db.retrieve(req, res, params, function (data) {
        if (!data)
          return req.db.sendError({code: 404, message: 'No account with that email address exists.'}, res);
        data.sendResetPasswordInstructions();
        return res.status(200).json({success: true, message: 'Successfully! sent password instructions.'});
      });
}

function verifyResetToken(req , res) {
    req.checkParams("token", "Invalid Token.").isLength({ min: 3 , max: 100 });
    req.checkBody("password", "Password should be at least 6 chars long.").isLength({ min: 6 });
    params.body = {where: {reset_password_token: req.params.token, reset_password_expires: {$gt: Date.now()}}};
  req.db.retrieve(req, res, params, function (data) {
    if (!data)
      return req.db.sendError({code: 422, message: 'Password reset token is invalid or has expired.'}, res);
    data.updateAttributes({
      password: bcrypt.hashSync(req.body.password, salt, null),
      reset_password_token: undefined,
      reset_password_expires: undefined
    }).then(function (result) {
      result.sendChangePasswordNotification();
      return res.status(200).send({success: true, message: 'Your password has been successfully changed.'});
    }).catch(function (error) {
      console.log(JSON.stringify(error, null, 2));
      return req.db.sendError({code: 422, message: 'Password reset token is invalid or has expired.'}, res);
    });
  });
}

function login(req, res) {
    req.checkBody("email", "Enter a valid email address.").isEmail().isLength({ min: 3 , max: 100 });
    req.checkBody("password", "Password should be at least 6 chars long.").isLength({ min: 6 });
    const email     = req.body.email;
    const password  = req.body.password;
    params.body =  {where: {email: email}}
    req.db.retrieve(req, res, params, function (user) {
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
        return req.db.sendError({code: 401, message: 'Authentication failed. Wrong Password.'}, res);
      }
    });
}

function signup(req, res) {

  req.checkBody("email", "Enter a valid email address.").isEmail().isLength({ min: 3 , max: 100 });
  req.checkBody("first_name", "First Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
  req.checkBody("first_name", "Last Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
  req.checkBody("password", "Password should be at least 6 chars long.").isLength({ min: 6 });
  req.checkBody("role", "Role can't be blank.").isLength({ min: 3 });
  params.body = {
    first_name: req.body.first_name,
    last_name: req.body.first_name,
    password: bcrypt.hashSync(req.body.password, salt, null),
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