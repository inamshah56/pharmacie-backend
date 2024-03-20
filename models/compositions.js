module.exports = (sequelize, DataTypes) => {
    const Composition = sequelize.define("Composition", {
        id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
    },{
        underscored: true,
    });
    return Composition;
};
  