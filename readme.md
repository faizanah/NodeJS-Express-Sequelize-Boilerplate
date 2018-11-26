Node Express Sequelize API!
===================

An opinionated boilerplate for Node web **APIs** focused on separation of concerns and scalability.

----------

[TOC]


----------

Before we begin . ..
-------------
Let's take a moment to review the tools we're going to be using:


- [NodeJS][3] - We're going to use this to run JavaScript code on the server. So, we use the latest version of Node, v8.7.0 at the time of writing, so that we'll have access to most of the new features introduced in ES6.
- [Express][5] - As per their website, Express is a "Fast, unopinionated, minimalist web framework for Node.js".
- [Sequelize][4] - In addition, we're going to use Sequelize, which is a database [ORM][9] that will interface with the **MySQL**, **PostgreSQL**, **SQLite**, and **MariaDB** databases for us.
- [Postman][6] - A Chrome app that we'll use to practically test our API.


--------


Getting Started
-------------------

Grab the initial boilerplate and install the dependencies and start the server.
Make sure you have [Node.js][3] and the PostgreSQL installed.


> - git clone https://gitlab.com/faizan.engin/Node-Sequelize-API.git node-api
> - cd node-api
> - npm install
> - npm run start:dev

The **server/config/config.js** file contain our application configuration settings, such as database authentication configuration.

Be sure to update the **server/config/config.js** file for your development, test, and production databases:


```
require('dotenv').config();
module.exports = {
    "development": {
        "username": "database username",
        "password": "database password",
        "database": "development_database",
        "host":     "localhost",
        "port": 5432,
        "dialect": "postgres" // mysql , postgres , mariadb , sqlite
    },
    "test": {
       "username": "database username",
        "password": "database password",
        "database": "test_database",
        "host":     "localhost",
        "port": 5432,
        "dialect": "postgres" // mysql , postgres , mariadb , sqlite
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": process.env.DB_NAME,
        "host":     process.env.DB_HOST,
        "port": 5432,
        "dialect": "postgres" // mysql , postgres , mariadb , sqlite
    }
};
```
If you are just running this locally, using the basic development server, then just update the development config.

----------


API Flow
--------------------
#### Signup

Post request to `/api/register/`
```
{
	"first_name": "Faizan",
	"last_name": "Ahmad",
	"email": "faizan.ahmad@virtialforce.io",
	"password": "password"
}
```

Response
```
{
    "success": true,
	"user":{
	    "id": 4,
	    "firstName": "Faizan",
	    "lastName": "Ahmad",
	    "passwordHash": "$2a$10$Ze9c2PFdo6DbYtpyJyZJNutymqI71uhOJkkp5ROcPM.ynbG0dyO",
	    "email": "faizan.ahmad@virtialforce.io",
	    "createdAt": "2017-09-22T07:46:19.173Z",
	    "updatedAt": "2017-09-22T07:46:19.173Z"
	},
	 "message": "Successfully register."
 }
```

#### Login
Using your account credentials you need to create a session to receive a token to authenticate all other API calls.

Post request to /api/login
```
{
	"email": "faizan.ahmad@engintechnologies.com",
	"password": "password"
}
```

Response
```
{
    "success": true,
    "user": {
        "id": 4,
        "firstName": "Faizan",
        "lastName": "Ahmad",
        "passwordHash": "$2a$10$eKcnjg6J.UdXzO/mwKlfzu.eIp391EDiXEBlO5cHiVAW2IT3Nq",
        "email": "faizan.ahmad@engintechnologies.com",
        "createdAt": "2017-09-18T14:16:01.983Z",
        "updatedAt": "2017-09-18T14:16:01.983Z"
    },
    "message": "Successfully login.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZhaXphbkBlbmdpbmV0ZWNoLmlvIidsZLyeicvlVN7eWnLuMuOi5E5y-_TYY"
}
```

To  authenticate all the request you need to set the Authoization header `-H 'authorization: {{token}}'` using your token and send this along with your request.

---------
Sequelize
-------------

With Postgres listening on port **5432**, we can make a connection to it using the [Sequelize library][4], an [Object Relational Mapper (ORM)][9], written in JavaScript, which supports **MySQL**, **PostgreSQL**, **SQLite**, and **MariaDB**.

Let's begin by installing [Sequelize CLI][2] package.


```
$ npm install -g sequelize-cli
```


#### <i class="icon-upload"></i> Generating Models



Now let’s create a model along with a migration. Since we’re working with users, run the following command:

```
$ sequelize model:create --name User --attributes "firstName:string, lastName:string,email:string,passwordHash:string,invitationToken:string"
```
This will generate a `user.js` file in the **server/models** folder as well as a `<date>-create-user.js` migration file in the **server/migrations folder**. `<date>` will be the date the model was generated.



----------


Creating Controllers and Routing
--------------------

With our models in place, let's move on to creating the controllers. We're going to have one controllers, usersController. The usersController will be responsible for creating, listing, updating and deleting users resource.

For creating a controller run the following command.

```
$ touch server/controllers/users_old.js
```
Next, we’re going to be exporting our users Controller in index.js file inside server/controllers.  I find this helpful since it helps me consolidate my imports (require statements) from once central place.

`/server/controllers/index.js`
```
module.exports = {
    users:  require('./users')
};
```

#### <i class="icon-upload"></i> Creating Users

After, creating a `users_old.js` file inside `server/controllers/`. Inside this file, let's add the functionality to create users.

`/server/controllers/users_old.js`
```
const db         = require('../config/db');
var params       = {tableName: 'User' , body: {} , condition: {}};

function create(req, res) {

    params.body = {
        firstName: req.body.firstName,
        lastName:  req.body.lastName,
        email: req.body.email,
        passwordHash: req.body.password
    };
    return db.create(res,params);
}

module.exports = {
    create: create
};
```
Next, we need to add an API route that maps to this functionality.
Inside server/routes/index.js, add the following code:

`/server/routes/users_old.js`
```
const controller = require('../controllers');
const usersController = controller.users;

module.exports = function (app) {

    app.post('/api/users',  usersController.create);

};
```
If we post some data to `/api/users`, we are telling our application to run the usersController.create a function, which will take the request object, extract the posted data and create a user from it. In this case, we say that the usersController.create function is the `POST` route handler for the `/api/users` endpoint.

#### <i class="icon-upload"></i> Listing Users

Next, we're going to add functionality to list all users in descending order. Add the following code snippet to your `usersController` after the create method.

`server/controllers/users_old.js`
```
const db         = require('../config/db');
var params       = {tableName: 'User' , body: {} , condition: {}};

....
function list(req , res){
    params.body = {order: [['createdAt', 'DESC']]};
    return db.list(req,res , params);
}

....

module.exports = {
    create: create,
    list: list
};

```
In this code snippet, we're fetching all users from our database and sending them back to the user as an array in the response. If we encounter an error while fetching the users from the database, we send that error object instead.

Next, open up `server/routes/index.js` and create a new url that maps a users `GET` request to the list method right below the `POST` route we'd added earlier.

`server/routes/index.js`
```
app.post('/api/users',  usersController.create);
app.get('/api/users',  usersController.list);
```


#### <i class="icon-upload"></i> Retrieving a single User

Next, we're going to add functionality to retrieve one user based on it's id. Add the following code snippet to your `usersController` after the create method.

`server/controllers/users_old.js`
```
const db         = require('../config/db');
var params       = {tableName: 'User' , body: {} , condition: {}};

....
function retrieve(req , res) {
    params.condition = {where: {id: req.params.id}};
    return db.retrieve(res , params);


....

module.exports = {
    create: create,
    list: list,
    retrieve: retrieve
};

```

In the code snippet above, we're finding the user whose id matches the userId we get from the request parameters.
If such a user exists, we're sending it back in the response. If it doesn't, we're sending back an error message letting the user know we didn't find the specified user.

Next, Then add a new route that maps to the retrieve view:

`server/routes/index.js`
```
app.get('/api/users/:id',  usersController.retrieve);
```



#### <i class="icon-pencil"></i> Updating a single User

Finally, let's add functionality to update a single user:

`/server/controllers/users_old.js`

```
const db         = require('../config/db');
var params       = {tableName: 'User' , body: {} , condition: {}};

....
function update(req,res) {
    params.condition = {where: { id: req.params.id} };
    params.body = {
        firstName: req.body.firstName,
        lastName:  req.body.lastName
    };
    return db.update(res , params);
}

....

module.exports = {
    create: create,
    list: list,
    retrieve: retrieve,
    update:update
};
```
We also need to add a new route that maps to the update method:


Inside `server/routes/index.js`, add the following code:

```
...

app.put('/api/users/:id',  usersController.update);
```

#### <i class="icon-trash"></i> Deleting a single User
Finally, let's add functionality to delete users:

`/server/controllers/users_old.js`

```
const db         = require('../config/db');
var params       = {tableName: 'User' , body: {} , condition: {}};

....
function destroy(req , res) {
    params.condition = {where: {id: req.params.id}};
    return db.destroy(res , params);
}
....

module.exports = {
    create: create,
    list: list,
    retrieve: retrieve,
    update:update,
    destroy: destroy
};
```
We also need to add a new route that maps to the destroy method:
Inside `server/routes/index.js`, add the following code:

```
....
app.delete('/api/users/:id',  usersController.destroy);
```


----------

### Routes

Next, we need to add an API route that maps to this functionality.  Inside the **server/routes/index.js** file. We are going to place all our routes in this index.js file. However, in a real-world application, you might want to split up your routes and place then in different folders.

```
const authHelper = require('../helpers/authhelper');
const controller = require('../controllers');
const authController = controller.auth;
const usersController = controller.users;

module.exports = function (app) {
    app.get('/api', function(req, res){
        res.status(200).send({message: 'Welcome to the NODE-Sequelize API!'});
    });

    app.post('/api/login', authController.login);

    app.post('/api/register',  usersController.create);
    app.get('/api/users', authHelper.isAuthenticated , usersController.list);
    app.get('/api/users/:id', authHelper.isAuthenticated,usersController.retrieve);
    app.put('/api/users/:id', authHelper.isAuthenticated,usersController.update);
    app.delete('/api/users/:id', authHelper.isAuthenticated, usersController.destroy);
};
```

`authHelper.isAuthenticated` is a helper method that is used to authoization the request with the token.

----------

### Contributing
1. Fork it!
2. Create your feature branch: git checkout -b my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request!



  [1]: http://docs.sequelizejs.com/manual/tutorial/migrations.html
  [2]: https://github.com/sequelize/cli
  [3]: https://nodejs.org/en/
  [4]: http://docs.sequelizejs.com
  [5]: https://expressjs.com
  [6]: https://www.getpostman.com/docs/postman/launching_postman/navigating_postman
  [9]: https://en.wikipedia.org/wiki/Object-relational_mapping