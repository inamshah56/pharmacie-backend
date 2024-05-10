module.exports = (sequelize, Sequelize) => {
    const ProductBidding = sequelize.define("ProductBidding", {
        id:{
          type: Sequelize.DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        price: {type: Sequelize.DataTypes.INTEGER}
    },{
        underscored: true,
    });
  
    return ProductBidding;
};