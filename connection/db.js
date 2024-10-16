const db = require("../models/index");

const connectDB = async () => {
  try { 
    console.log({ force: process.env.FORCE_DB })
    await db.sequelize.sync({ alter: process.env.ALTER_DB });
    console.log("Connected to the database!");
    console.log(`Server is running on Port: 2033`);
    console.log("Press CTRL + C to stop the process.");
    console.log("=====================================================================================================================");
    console.log("=====================================================================================================================");
    console.log("=====================================================================================================================");
  } catch (error) {
    console.error("Cannot connect to the database!", error);
  }
};

module.exports = connectDB;
