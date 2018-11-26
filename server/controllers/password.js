const bcrypt     = require('bcrypt');
const salt       = bcrypt.genSaltSync(10);
function changePassword(req , res) {
    var data = {
        currentPassword: req.body.current_password,
        newPassword: req.body.new_password,
        confirmPassword: req.body.confirm_password
    };
    if(data.newPassword == data.confirmPassword)
    {
        if(req.user.authenticate(data.currentPassword)){
            req.user.updateAttributes({password: bcrypt.hashSync(data.newPassword, salt, null)}).then(function(result){
              result.sendChangePasswordNotification();
              return res.status(200).send({success: true ,message: "Password successfully changed."});
            }).catch(function(error){
                req.db.sendError(error,res)
            });
        }else{
            return req.db.sendError({code: 422 , message: 'Current password does not match.'},res);
        }
    }else{
        req.db.sendError({message: 'Confirm password does not match'} , res)
    }
}

module.exports = {
    changePassword: changePassword
};
