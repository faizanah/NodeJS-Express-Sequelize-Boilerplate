const models              = require('../models');
const responseHelper      = require('../helpers/responseHelper');

var _limit = 10;   // number of records per page
var offset = 0;

function pagination(data , req) {
    var page = parseInt(req.query.page) || 1;
    var count =  data.count || data.length || 0;
    var pages = Math.ceil(count/ _limit);
    var is_last = pages == page;
    var is_first = 1 == page;
    var result = {};
    result.total = count;
    result.pages = pages;
    result.per_page = _limit;
    result.current = page;
    result.next  = is_last ? null : page + 1;
    result.prev = is_first ? null : page - 1;
    result.is_first = is_first;
    result.is_last = is_last;
    return result;
}

function  create(req, res , params , cb) {
    if(errors = req.validationErrors())
        responseHelper.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else{
        var includes = params.include || {};
        return models[params.tableName].create(params.body , includes).then(function(data){


                cb(data);
            else
                res.status(201).send({success: true , data: data , message: "Successfully created."});
        }).catch(function (err) {
            responseHelper.sendError(err, res)
        });
    }
}

function count(res , params , cb) {

    if(errors = req.validationErrors())
        responseHelper.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else{
        models[params.tableName].count(params.body).then(function(count) {
            if (typeof(cb) == 'function')
                cb(count);
            else
                res.status(200).send({success: true, count: count});
        }).catch(function (error) {
            console.log(JSON.stringify(error, null, 2));
            responseHelper.sendError(error, res);
        });
    }
}

function list(req, res , params , cb ) {

    if(errors = req.validationErrors())
        responseHelper.sendError({name: 'ValidationErrors' , errors: errors} , res);
    else{
        var _pagination = false;
        if(typeof(params['pagination']) != 'undefined' && params['pagination'] == 'false'){
            var _pagination = false;
        }else{
            _pagination = true;
            var page = parseInt(req.query.page) || 1;      // page number
            offset = _limit * (page - 1);
            params.body.limit = _limit;
            params.body.offset = offset;
            params.body.order = [['created_at', 'ASC']];
        }
        console.log(JSON.stringify(params , null ,2));
        models[params.tableName].findAndCountAll(params.body).then(function (data) {
            if(typeof(cb) == 'function'){
                cb(data);
            }else if(_pagination)
                res.status(200).send({success: true, data: data.rows, pagination: pagination(data , req)});
            else
                res.status(200).send({success: true, data: data.rows});
        }).catch(function (error) {
            console.log(JSON.stringify(error, null, 2));
            responseHelper.sendError(error, res);
        });
    }
}

function retrieve(req , res , params , callback) {
    if(errors = req.validationErrors())
    {
        var response = { errors: [] };
        errors.forEach(function(err) {
            response.errors.push({message: err.msg});
        });
        res.status(422).send({status: 422 , success: false , errors: response.errors});
    }
    else{
        return models[params.tableName].findOne(params.body).then(function (data) {
            if(typeof(callback) == 'function')
                callback(data);
            else
                res.status(200).send({success: true, data: data});
        }).catch(function(error){
            console.log(JSON.stringify(error , null ,2));
            responseHelper.sendError(error,res)
        });
    }
}

// function retrieveWithCallback(req , res , params , callback) {
//
//     if(errors = req.validationErrors())
//     {
//         var response = { errors: [] };
//         errors.forEach(function(err) {
//             response.errors.push({message: err.msg});
//         });
//         res.status(422).send({status: 422 , success: false , errors: response.errors});
//     }
//     else{
//         console.log(JSON.stringify(params , null ,2));
//         return models[params.tableName].findOne(params.body).then(callback).catch(function(error){
//             console.log(JSON.stringify(error , null ,2));
//             responseHelper.sendError(error,res)
//         });
//     }
// }

// function listWithCallback(req , res , params , callback) {
//
//     if(errors = req.validationErrors())
//     {
//         var response = { errors: [] };
//         errors.forEach(function(err) {
//             response.errors.push({message: err.msg});
//         });
//         res.status(422).send({status: 422 , success: false , errors: response.errors});
//     }
//     else{
//         var page = parseInt(req.query.page) || 1;      // page number
//         offset = _limit * (page - 1);
//         params.body.limit = _limit;
//         params.body.offset = offset;
//         console.log(JSON.stringify(params , null ,2));
//         models[params.tableName].findAndCountAll(params.body).then(callback).catch(function (error) {
//             console.log(JSON.stringify(error, null, 2));
//             responseHelper.sendError(error, res);
//         });
//     }
// }
//
// function createWithCallback(req , res , params , callback) {
//
//     if(errors = req.validationErrors())
//     {
//         var response = { errors: [] };
//         errors.forEach(function(err) {
//             response.errors.push({message: err.msg});
//         });
//         res.status(422).send({status: 422 , success: false , errors: response.errors});
//     }
//     else{
//         console.log(JSON.stringify(params , null ,2));
//         return models[params.tableName].create(params.body).then(callback).catch(function(error){
//             console.log(JSON.stringify(error , null ,2));
//             responseHelper.sendError(error,res)
//         });
//     }
// }

function bulkCreate(res , params , cb){

    if(errors = req.validationErrors())
    {
        var response = { errors: [] };
        errors.forEach(function(err) {
            response.errors.push({message: err.msg});
        });
        res.status(422).send({status: 422 , success: false , errors: response.errors});
    }
    else{
        console.log(JSON.stringify(params , null ,2));
        const message = params.message || "Successfully created.";
        return models[params.tableName].bulkCreate(params.body).then(function(data){
            if (typeof(cb) == 'function')
                cb(data);
            else
                res.status(201).send({success: true , data: data , message: message})

        }).catch(function(error){
            console.log(JSON.stringify(error , null ,2));
            responseHelper.sendError(error,res)
        });
    }
}

function update(req, res, params , cb)
{
    if(errors = req.validationErrors())
    {
        var response = { errors: [] };
        errors.forEach(function(err) {
            response.errors.push({message: err.msg});
        });
        res.status(422).send({status: 422 , success: false , errors: response.errors});
    }
    else{
        if (typeof(cb) == 'function') {
            console.log("CB is function.");
            return models[params.tableName].findOne(params.condition).then(function(data)
            {
                if (!data){
                    return responseHelper.notFound(res);
                }else {
                    data.updateAttributes(params.body).then(cb).catch(function(error){
                        console.log(JSON.stringify(error , null ,2));
                        responseHelper.sendError(error,res)
                    });
                }
            }).catch(function(error){
                console.log(JSON.stringify(error , null ,2));
                responseHelper.sendError(error,res)
            });

        }else {
            console.log("CB is not a function.");
            return models[params.tableName].findOne(params.condition).then(function(data)
            {
                if (!data){
                    return responseHelper.notFound(res);
                }else {
                    data.updateAttributes(params.body).then(function(result){
                        if (!result) {
                            return responseHelper.notFound(result);
                        }
                        return res.status(200).send({success: true , data: result , message: "Successfully Updated."});
                    }).catch(function(error){
                        console.log(JSON.stringify(error , null ,2));
                        responseHelper.sendError(error,res)
                    });
                }
            }).catch(function(error){
                console.log(JSON.stringify(error , null ,2));
                responseHelper.sendError(error,res)
            });

        }
    }

}


function response(req , res , objs , cb) {

    console.log("CB is function: " + typeof(cb));
    objs.then(function(data){
        if (typeof(cb) == 'function')
            cb(data);
        else if(typeof(cb) == 'boolean' && cb == true) {
            var page = parseInt(req.query.page) || 1;
            var offset = _limit * (page - 1);
            return res.status(200).send({success: true, data: data.slice(offset, offset + _limit), pagination: pagination(data, req)});
        }else
            return res.status(200).send({success: true, data: data});
    }).catch(function (err) {
        responseHelper.sendError(err, res)
    });
}

function destroy(req , res , params) {

    if(errors = req.validationErrors())
    {
        var response = { errors: [] };
        errors.forEach(function(err) {
            response.errors.push({message: err.msg});
        });
        res.status(422).send({status: 422 , success: false , errors: response.errors});
    }
    else{
        return models[params.tableName].destroy(params.condition).then(function(data) {
            return res.status(200).send({success: true , message: "Successfully Deleted."});
        }).catch(function(error){
            console.log(JSON.stringify(error , null ,2));
            return responseHelper.sendError(error,res)
        });
    }
}

function limit() {
    return _limit;
}

module.exports = {
    sendError: responseHelper.sendError,
    notFound: responseHelper.notFound,
    models: models,
    create: create,
    list: list,
    retrieve: retrieve,
    update: update,
    destroy: destroy,
    // retrieveWithCallback: retrieveWithCallback,
    // createWithCallback: createWithCallback,
    bulkCreate: bulkCreate,
    count: count,
    // listWithCallback: listWithCallback,
    response: response,
    pagination: pagination,
    limit: limit
};