module.exports = function (app , controller) {
  app.post(controller.getUrl('/courses'),controller.requireAuthentication, controller.courses.create);
  app.get(controller.getUrl('/courses') ,controller.requireAuthentication, controller.courses.list);
  app.get(controller.getUrl('/courses/:id'), controller.requireAuthentication,controller.courses.retrieve);
  app.put(controller.getUrl('/courses/:id'),controller.requireAuthentication, controller.courses.update);
  app.delete(controller.getUrl('/courses/:id'),controller.requireAuthentication, controller.courses.destroy);
};