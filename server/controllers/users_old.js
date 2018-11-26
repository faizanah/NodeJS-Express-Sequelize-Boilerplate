const tableName = 'User';
var params = {tableName: 'User' , body: {} , where: {} , include: []};

function list(req , res){
    params.body = { include: ['user_detail']};
    params.pagination = req.query.pagination;
    return req.db.list(req , res , params);
}

function create(req , res) {
    req.checkBody("name", "Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("email" , 'Enter a valid email address.').isEmail();
    params.body = {
        name: req.body.name,
        email: req.body.email
    };
    params.include = {include: ['user_detail']};
    return req.db.create(req , res , params);
}

function count(req , res) {
    req.db.count(res, params);
}

function retrieve(req , res)
{
    params.body = {where: {id: req.params.id} , include: ['user_detail' , 'storage_sessions']};
    return req.db.retrieve(req , res , params);
}

function update(req,res) {
    req.checkBody("name", "Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
    req.checkBody("sex", "Invalid user Gender.").isIn(['Male', 'Female']);
    req.checkBody("email" , 'Enter a valid email address.').isEmail();
    req.checkBody("remote_id", "Invalid remote id.").optional().isInt();
    req.checkParams("id", "Invalid user id.").isInt();
    params.condition = {where: { id: req.params.id} };
    params.body = {
        name: req.body.name,
        email: req.body.email,
        remote_id:  req.body.remote_id
    };
    return req.db.update(req , res , params , function (user) {

    });
}

function destroy(req , res) {
    params.condition = {where: {id: req.params.id}};
    return req.db.destroy(req , res , params);
}

module.exports = {
    list: list,
    count: count,
    retrieve: retrieve,
    destroy: destroy,
    update : update,
    create: create
};