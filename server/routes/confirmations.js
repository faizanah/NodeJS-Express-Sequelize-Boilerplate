module.exports = function (app , controller) {
  app.post(controller.getUrl('/confirmations'), controller.confirmations.reset);
  app.post(controller.getUrl('/confirmations/:token'), controller.confirmations.verifyConfirmationtToken);
};