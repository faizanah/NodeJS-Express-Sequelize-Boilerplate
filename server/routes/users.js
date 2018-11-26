module.exports = function (app , controller) {
  app.post(controller.getUrl('/users'),controller.requireAuthentication, controller.users.create);
  app.get(controller.getUrl('/users') ,controller.requireAuthentication, controller.users.list);
  app.get(controller.getUrl('/users/:id'), controller.requireAuthentication,controller.users.retrieve);
  app.put(controller.getUrl('/users/:id'), controller.requireAuthentication ,controller.users.update);
  app.delete(controller.getUrl('/users/:id'), controller.requireAuthentication , controller.users.destroy);
  app.put(controller.getUrl('/profile'), controller.requireAuthentication  ,  controller.users.profile);
};