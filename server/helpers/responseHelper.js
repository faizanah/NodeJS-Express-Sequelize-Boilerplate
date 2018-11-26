// Error handling
function sendError(err, res){
    var code = 422;
    if(typeof err == 'object' ){
        code = err.code || 422;
        if(err.name == "SequelizeHostNotFoundError")
        {
            res.status(code).send({status: code , success: false , errors: [{message: 'DB Connection Issue.'}]});
        }
        else if(err.name == "SequelizeConnectionError"){
            res.status(code).send({status: code , success: false , errors: [{message: 'DB Connection Issue.'}]});
        }
        else if(err.name == "SequelizeUniqueConstraintError" || err.name == "SequelizeValidationError")
        {
            res.status(code).send({status: code , success: false , errors: err.errors});
        }
        else if(err.name == "ValidationErrors")
        {
            var response = { errors: [] };
            err.errors.forEach(function(error) {
                response.errors.push({param: error.param , message: error.msg});
            });
            res.status(code).send({status: code , success: false , errors: response.errors});
        }
        else{
            res.status(code).send({status: code , success: false , errors: [{message: err.message}] , error: err});
        }
    }else{
        res.status(422).send({status: 422 , success: false , errors: [{message: err}] });
    }
}



function notFound(res)
{
    res.status(404).send({success: false , errors: [{message: 'Not Found'}]});
}

module.exports = {

    sendError: sendError,
    notFound: notFound
};