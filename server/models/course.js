'use strict';
module.exports = function(sequelize, DataTypes) {
  const Course = sequelize.define("Course", {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    created_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        model: 'User',
        key: 'id'
      }
    }

  },{
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    tableName: 'courses'
  });
  Course.associate = function (models) {
    Course.belongsTo(models.User , { as: 'created_by' ,  foreignKey: 'created_by_id' });
  };
  return Course;
};