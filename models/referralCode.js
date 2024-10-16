module.exports = (sequelize, Sequelize) => {
    const ReferralCode = sequelize.define('referral_code', {
      
     
      phone: {
        type:Sequelize.DataTypes.STRING,
        primaryKey: true,

      },
      referralCode: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      expiresAt: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal("NOW() + INTERVAL '30 DAY'"),  
      },
       count: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
    

    },{
      underscored: true,
    });
    return ReferralCode;
  };