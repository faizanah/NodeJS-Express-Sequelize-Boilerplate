'use strict';
require('dotenv').config();
const bcrypt = require('bcrypt');
const crypto     = require('crypto');
const mailer     = require('../config/mailer');
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
    confirmation_token: {
      type: DataTypes.STRING
    },
    confirmation_token_expires: {
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
      defaultValue: 'student',
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
  });
  User.afterCreate(function(user, options, cb) {
    user.sendConfirmationInstructions();
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

  User.prototype.sendConfirmationInstructions = function sendConfirmationInstructions(){
    var user = this;
    crypto.randomBytes(20, function (err, buf) {
      user.updateAttributes({
        confirmation_token: buf.toString('hex'),
        confirmation_token_expires: Date.now() + 3600000
      }).then(function (result) {
        var mailOptions = {
          to: result.email,
          subject: 'Confirmation Instructions',
          text: "Activation link. \n\n" +
          'http://example.com/users/invitations/' + result.confirmation_token + '\n\n'
        };
        mailer.sendMail(mailOptions, function (err) {
        });
      }).catch(function (error) {
        console.log(JSON.stringify(error, null, 2));
      });
    });
  };

  User.prototype.sendResetPasswordInstructions = function sendResetPasswordInstructions(){
    var user = this;
    crypto.randomBytes(20, function (err, buf) {
      user.updateAttributes({
        reset_password_token: buf.toString('hex'),
        reset_password_expires: Date.now() + 3600000
      }).then(function (result) {
        var mailOptions = {
          to: result.email,
          subject: 'Password Reset Instructions',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://example.com/invitations/' + result.reset_password_token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        mailer.sendMail(mailOptions, function (err) {
        });
      }).catch(function (error) {
        console.log(JSON.stringify(error, null, 2));
      });
    });
  };

  User.prototype.sendChangePasswordNotification = function sendChangePasswordNotification(){
    var user = this;
    var mailOptions = {
      to: user.email,
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
      'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    mailer.sendMail(mailOptions, function (err) {
    });
  };

  User.prototype.generateJwtToken = function generateJwtToken() {
    return jwt.sign({ email: this.email, id: this.id}, secret);
  };

  return User;
};