module.exports = (sequelize, Sequelize) => {
    const SeedProducts = sequelize.define('SeedProducts', {
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
        name: Sequelize.DataTypes.STRING,
        brand: Sequelize.DataTypes.STRING,
        seed: Sequelize.DataTypes.STRING,
        seedVariety: Sequelize.DataTypes.STRING,
        seedType: Sequelize.DataTypes.STRING,
        suitableRegion: Sequelize.DataTypes.STRING,
        seedWeight: Sequelize.DataTypes.FLOAT,
        pkgType: Sequelize.DataTypes.STRING,
        weightUnit: Sequelize.DataTypes.STRING,
        pkgWeight: Sequelize.DataTypes.FLOAT,
        pkgQuantity: Sequelize.DataTypes.INTEGER,
        description: Sequelize.DataTypes.STRING(6000),
        ProductType: Sequelize.DataTypes.STRING,
        image: Sequelize.DataTypes.JSON,
        isVerified: Sequelize.DataTypes.BOOLEAN
    },{
        underscored: true,
      });
  
    return SeedProducts;
  };
  