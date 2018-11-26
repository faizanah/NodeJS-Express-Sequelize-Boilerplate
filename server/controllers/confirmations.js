const bcrypt     = require('bcrypt');
const salt       = bcrypt.genSaltSync(10);
var params       = {tableName: 'User' , body: {}};

function reset(req,res , next) {
  req.checkBody("email", "Enter a valid email address.").isEmail().isLength({ min: 3 , max: 100 });
  params.body = {where: {email: req.body.email, status: 'pending'}};
  req.db.retrieve(req, res, params, function (data) {
    if (!data)
      return req.db.sendError({code: 404, message: 'No account with that email address exists.'}, res);
    data.sendConfirmationInstructions();
    return res.status(200).json({success: true, message: 'Successfully! sent confirmation instructions.'});
  });
}

function verifyConfirmationtToken(req , res) {
  req.checkParams("token", "Invalid confirmation Token.").isLength({ min: 3 , max: 100 });
  params.body = {where: {status: 'pending', confirmation_token: req.params.token, confirmation_token_expires: {$gt: Date.now()}}};
  req.db.retrieve(req, res, params, function (data) {
    if (!data)
      return req.db.sendError({code: 422, message: 'Confirmation token is invalid or has expired.'}, res);
    data.updateAttributes({
      confirmation_token: undefined,
      confirmation_token_expires: undefined,
      status: 'accepted'
    }).then(function (result) {
      result.sendConfirmationNotification();
      return res.status(200).send({success: true, message: 'Your email has been successfully verified.'});
    }).catch(function (error) {
      console.log(JSON.stringify(error, null, 2));
      return req.db.sendError({code: 422, message: 'Confirmation token is invalid or has expired.'}, res);
    });
  });
}

module.exports = {
  reset: reset,
  verifyConfirmationtToken: verifyConfirmationtToken
};