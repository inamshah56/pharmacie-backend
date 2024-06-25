module.exports = (sequelize, Sequelize) => {
  const Address = sequelize.define('Address', {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: Sequelize.DataTypes.UUIDV4
    },
    shop: Sequelize.DataTypes.STRING,
    address: Sequelize.DataTypes.STRING(2000),
    tehsil: Sequelize.DataTypes.STRING,
    province: Sequelize.DataTypes.STRING,
    district: Sequelize.DataTypes.STRING,
  }, {
    underscored: true,
  });
  return Address;
};