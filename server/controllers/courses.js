var params = {tableName: 'Course' , body: {}};

function list(req , res){
  params.pagination = req.query.pagination;
  params.body = {where: {created_by_id: req.user.id} };
  return req.db.list(req , res , params);
}

function create(req, res) {
  req.checkBody("name", "Course Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
  params.body = {
    name: req.body.name,
    created_by_id: req.user.id
  };
  return req.db.create(req , res , params);
}

function update(req,res) {
  req.checkBody("name", "Course Name must be between 2 and 50 characters in length.").isLength({ min: 2 , max: 50 });
  params.condition = {where: {created_by_id: req.user.id, id: req.params.id} };
  params.body = {
    name: req.body.name
  };
  return req.db.update(req , res , params);
}


function retrieve(req , res)
{
  params.body = {where: {created_by_id: req.user.id, id: req.params.id}};
  return req.db.retrieve(req , res , params);
}

function destroy(req , res)
{
  params.condition = {where: {created_by_id: req.user.id, id: req.params.id} };
  return req.db.destroy(req , res , params);
}

module.exports = {
  list: list,
  create: create,
  update:update,
  retrieve: retrieve,
  destroy: destroy
};