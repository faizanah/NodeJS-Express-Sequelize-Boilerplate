'use strict';
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt     = require('jsonwebtoken');
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config.js')[env];
var secret    = config.secret;

const roles  = ['student', 'instructor'];
module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define("User", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    first_name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    last_name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    profile_pic_url: {
      type: DataTypes.STRING
    },
    user_mode: {
      type:   DataTypes.STRING
    },
    location: {
      type: DataTypes.STRING
    },
    gender: {
      type:   DataTypes.ENUM,
      values: ['M' , 'F'],
      validate: {
        isIn: {
          args: [['M','F']],
          msg: "Invalid user Gender."
        }
      }
    },
    birth_date: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
    password: {
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [6, Infinity]
      }
    },
    reset_password_token: {
      type: DataTypes.STRING
    },
    reset_password_expires: {
      type: DataTypes.DATE
    },
    invitation_token: {
      type: DataTypes.STRING
    },
    invitation_token_expires: {
      type: DataTypes.DATE
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email address already in use!'
      },
      validate: {
        len: {
          args: [6, 128],
          msg: "Email address must be between 6 and 128 characters in length"
        },
        isEmail: {
          msg: "Email address must be valid"
        }
      }
    },
    role: {
      allowNull: false,
      type:   DataTypes.ENUM,
      values: roles,
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [roles],
          msg: "Invalid user role."
        }
      }
    },
    status: {
      allowNull: false,
      type:   DataTypes.ENUM,
      values: ['pending' , 'accepted'],
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending' , 'accepted']],
          msg: "Invalid status."
        }
      }
    }

  },{
    indexes: [{unique: true, fields: ['email']}],
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'users'
  });
  User.associate = function (models) {
  };

  User.prototype.authenticate = function authenticate(value) {
    if (bcrypt.compareSync(value, this.password))
      return this;
    else
      return false;
  };
  User.beforeSave(function(user, options) {
    user.email = user.email.toLowerCase();
    console.log(user.email);
  });
  User.prototype.authenticateResetPasswordToken = function authenticateResetPasswordToken(value) {
    if (bcrypt.compareSync(value, this.password))
      return this;
    else
      return false;
  };

  User.prototype.authenticateInvitationToken = function authenticateInvitationToken(value) {
    if (bcrypt.compareSync(value, this.password))
      return this;
    else
      return false;
  };

  User.prototype.isStudent = function isStudent(){
    return this.role == 'student';
  };

  User.prototype.generateJwtToken = function generateJwtToken() {
    return jwt.sign({ email: this.email, id: this.id}, secret);
  };

  return User;
};