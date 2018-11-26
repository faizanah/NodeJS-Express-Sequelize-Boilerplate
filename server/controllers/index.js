var fs = require('fs');
function getUrl(url) {
  return '/api' + url;
}
var routes = {
  requireAuthentication: require('../helpers/authhelper').isAuthenticated,
  getUrl: getUrl
};
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file){
    var name = file.replace('.js', '');
    routes[name] = require(__dirname +'/'+ name)
  });

module.exports = routes;