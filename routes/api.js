var express = require("express");

var app = express();

app.use("/auth/", require("./auth"));
app.use("/product/", require("./product"))
app.use("/tech/", require("./tech"))
app.use("/simulator/", require("./simulatorSolution"))
app.use("/payment/", require("./payment"))
app.use("/referrals/", require("./referralCodeRoutes"))

module.exports = app;
