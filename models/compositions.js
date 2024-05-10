module.exports = (sequelize, Sequelize) => {
    const Composition = sequelize.define("Composition", {
        id:{
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: Sequelize.DataTypes.STRING,
        unit: Sequelize.DataTypes.STRING,
        volume: Sequelize.DataTypes.FLOAT,
    },{
        underscored: true,
    });
    return Composition;
};
  