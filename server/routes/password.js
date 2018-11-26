module.exports = function (app , controller) {
    app.post(controller.getUrl('/settings/change_password'), controller.requireAuthentication , controller.password.changePassword);
};