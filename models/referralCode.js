module.exports = (sequelize, Sequelize) => {
  const ReferralCode = sequelize.define('referral_code', {
    phone: {
      type: Sequelize.DataTypes.STRING,
      primaryKey: true,
    },
    referralCode: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    maxDays: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    expiresAt: {
      type: Sequelize.DataTypes.DATE
    },
    usageCount: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0
    },
    maxUsage: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    underscored: true,
  });
  return ReferralCode;
};