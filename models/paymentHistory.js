module.exports = (sequelize, Sequelize) => {
    const PaymentHistory = sequelize.define(
        'payment_history',
        {
            uid: {
                type: Sequelize.DataTypes.UUID,
                defaultValue: Sequelize.DataTypes.UUIDV4,
                primaryKey: true,
            },
            refered_by: {
                type: Sequelize.DataTypes.STRING,
            },
            service: {
                type: Sequelize.DataTypes.STRING,
                defaultValue: 'farmacie',
            },
            unit_price: {
                type: Sequelize.DataTypes.INTEGER,
                allowNull: false,
            },
            ref_no: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            retrival_ref_no: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            payment_provider: {
                type: Sequelize.DataTypes.STRING,
                allowNull: false,
            },
            sandbox: {
                type: Sequelize.DataTypes.BOOLEAN,
                defaultValue: false,
            }

        },
        {
            schema: 'public',
            underscored: true,
        });

    return PaymentHistory;
}



