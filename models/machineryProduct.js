module.exports = (sequelize, Sequelize) => {
    const MachineryProduct = sequelize.define('MachineryProduct', {
        id:{
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        uuid:{
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
          unique: true,
          defaultValue: Sequelize.DataTypes.UUIDV4
        },
        brand: Sequelize.DataTypes.STRING,
        name: Sequelize.DataTypes.STRING,
        horsePower: Sequelize.DataTypes.FLOAT,
        model: Sequelize.DataTypes.STRING,
        type: Sequelize.DataTypes.STRING,
        condition: Sequelize.DataTypes.STRING,
        image: Sequelize.DataTypes.JSON,
        discount: Sequelize.DataTypes.FLOAT,
        description: Sequelize.DataTypes.STRING(6000),
        ProductType: Sequelize.DataTypes.STRING,
        isVerified: Sequelize.DataTypes.BOOLEAN,
    },{
        underscored: true,
      });
  
    return MachineryProduct;
  };
  