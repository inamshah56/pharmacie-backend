'use strict';

const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.url) {
  sequelize = new Sequelize(config.url, config);
}
else if (config) {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

db["Address"] = require("./address")(sequelize, Sequelize);
db["Admin"] = require("./admin")(sequelize, Sequelize);
db["CompositionList"] = require("./compositionList")(sequelize, Sequelize);
db["Composition"] = require("./compositions")(sequelize, Sequelize);
db["ListingProduct"] = require("./listingProduct")(sequelize, Sequelize);
db["MachineryProduct"] = require("./machineryProduct")(sequelize, Sequelize);
db["Product"] = require("./product")(sequelize, Sequelize);
db["ProductBidding"] = require("./productBidding")(sequelize, Sequelize);
db["ProductRequest"] = require("./productRequest")(sequelize, Sequelize);
db["SeedProducts"] = require("./seedProduct")(sequelize, Sequelize);
db["User"] = require("./user")(sequelize, Sequelize);
db["PaymentHistory"] = require("./paymentHistory")(sequelize, Sequelize);
db["ReferralCode"] = require("./referralCode")(sequelize, Sequelize);


db.sequelize = sequelize;
db.Sequelize = Sequelize;

// =============== Relation Between Products and Product Listing ===============
db.Product.hasMany(db.ListingProduct, { as: "listingProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "productId", allowNull: true } })
db.ListingProduct.belongsTo(db.Product, { as: "product", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "productId", allowNull: true } })

// =============== Relation Between Seed and Product Listing ===============
db.SeedProducts.hasMany(db.ListingProduct, { as: "listingProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "seedProductId", allowNull: true } })
db.ListingProduct.belongsTo(db.SeedProducts, { as: "seedProducts", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "seedProductId", allowNull: true } })

// =============== Relation Between Machinary and Product Listing ===============
db.MachineryProduct.hasMany(db.ListingProduct, { as: "listingProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "mtProductId", allowNull: true } })
db.ListingProduct.belongsTo(db.MachineryProduct, { as: "machineryProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "mtProductId", allowNull: true } })

// =============== Relation Between Composition and Product ===============
db.Product.hasMany(db.Composition, { as: "composition", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "productId", allowNull: true } })
db.Composition.belongsTo(db.Product, { as: "product", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "productId", allowNull: true } })

// =============== Relation Between User and Product Listing ===============
db.User.hasMany(db.ListingProduct, { as: "listingProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "owner", allowNull: true } })
db.ListingProduct.belongsTo(db.User, { as: "user", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "owner", allowNull: true } })

// =============== Relation Between User and Address ===============
db.User.hasMany(db.Address, { as: "address", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "userId", allowNull: true } })
db.Address.belongsTo(db.User, { as: "user", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "userId", allowNull: true } })

// =============== Relation Between Product and Bidding ===============
db.ListingProduct.hasMany(db.ProductBidding, { as: "bidders", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "listingId", allowNull: true } })
db.ProductBidding.belongsTo(db.ListingProduct, { as: "product", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "listingId", allowNull: true } })

// =============== Relation Between Product and Product Request ===============
db.ListingProduct.hasMany(db.ProductRequest, { as: "request", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "listingId", allowNull: true } })
db.ProductRequest.belongsTo(db.ListingProduct, { as: "product", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "listingId", allowNull: true } })

// =============== Relation Between User and Product Request ===============
db.User.hasMany(db.ProductRequest, { as: "productRequest", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "userId", allowNull: true } })
db.ProductRequest.belongsTo(db.User, { as: "user", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "userId", allowNull: true } })

// =============== Relation Between User and Product Bidding ===============
db.User.hasMany(db.ProductBidding, { as: "bidding", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "userId", allowNull: true } })
db.ProductBidding.belongsTo(db.User, { as: "user", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "userId", allowNull: true } })

// =============== Relation Between User and SeedProduct ===============
db.User.hasMany(db.SeedProducts, { as: "seedProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "seedAddedBy", allowNull: true } })
db.SeedProducts.belongsTo(db.User, { as: "user", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "seedAddedBy", allowNull: true } })

// =============== Relation Between User and MachinaryProduct ===============
db.User.hasMany(db.MachineryProduct, { as: "machineProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "machineAddedBy", allowNull: true } })
db.MachineryProduct.belongsTo(db.User, { as: "user", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "machineAddedBy", allowNull: true } })

// =============== Relation Between User and Product ===============
db.User.hasMany(db.Product, { as: "product", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "addedBy", allowNull: true } })
db.Product.belongsTo(db.User, { as: "user", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "addedBy", allowNull: true } })

// =============== Relation Between Admin and SeedProduct ===============
db.Admin.hasMany(db.SeedProducts, { as: "seedProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "seedAddedByAdmin", allowNull: true } })
db.SeedProducts.belongsTo(db.Admin, { as: "admin", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "seedAddedByAdmin", allowNull: true } })

// =============== Relation Between Admin and MachinaryProduct ===============
db.Admin.hasMany(db.MachineryProduct, { as: "machineProduct", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "machineAddedByAdmin", allowNull: true } })
db.MachineryProduct.belongsTo(db.Admin, { as: "admin", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "machineAddedByAdmin", allowNull: true } })

// =============== Relation Between Admin and Product ===============
db.Admin.hasMany(db.Product, { as: "product", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "addedByAdmin", allowNull: true } })
db.Product.belongsTo(db.Admin, { as: "admin", onDelete: "CASCADE", onUpdate: "CASCADE", foreignKey: { name: "addedByAdmin", allowNull: true } })


// ===================================================================
// ============================ relations ============================
// ===================================================================


db.Address.hasMany(db.PaymentHistory, {
  foreignKey: 'address_id',
  sourceKey: 'id',
  as: 'payment_history',
});
db.PaymentHistory.belongsTo(db.Address, {
  foreignKey: 'address_id',
  targetKey: 'id',
  as: 'address',
});

db.User.hasMany(db.PaymentHistory, {
  foreignKey: 'user_id',
  sourceKey: 'id',
  as: 'payment_history',
});
db.PaymentHistory.belongsTo(db.User, {
  foreignKey: 'user_id',
  targetKey: 'id',
  as: 'user',
});

module.exports = db;