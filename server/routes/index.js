var fs = require('fs');
module.exports = function (app , controller) {

    app.get('/api/admin/', function(req, res){
        res.status(200).send({message: 'Welcome to the Admin API!'});
    });
    fs
        .readdirSync(__dirname)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file !== 'index.js');
        })
        .forEach(function(file){
            var name = file.replace('.js', '');
            require(__dirname +'/'+ name)(app , controller);
        });

    // catch 404 and forward to error handler
        app.use(function(req, res, next) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
        });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.send();
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send();
    });
};