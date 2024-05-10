module.exports = (sequelize, Sequelize) => {
    const ListingProducts = sequelize.define("ListingProduct", {
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
        shelfLifeStart: Sequelize.DataTypes.DATEONLY,
        availableFrom: Sequelize.DataTypes.DATEONLY,
        shelfLifeEnd: Sequelize.DataTypes.DATEONLY,
        bidding: Sequelize.DataTypes.STRING,
        price:  Sequelize.DataTypes.INTEGER,
        ProductType: Sequelize.DataTypes.STRING,
        addressId: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER),
        expiryDate: Sequelize.DataTypes.DATEONLY
    },{
        underscored: true,
      });
  
    return ListingProducts;
  };
  