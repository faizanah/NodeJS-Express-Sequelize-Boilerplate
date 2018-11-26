module.exports = function (app , controller) {
    app.post(controller.getUrl('/login'), controller.auth.login);
    app.post(controller.getUrl('/signup'), controller.auth.signup);
    app.post(controller.getUrl('/reset'), controller.auth.reset);
    app.post(controller.getUrl('/reset/:token'), controller.auth.verifyResetToken);
    // // app.delete('/api/auth/logout', authController.logout);
};