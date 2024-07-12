var express = require("express");

var app = express();

app.use("/auth/", require("./auth"));
app.use("/product/", require("./product"))
app.use("/tech/", require("./tech"))

app.use("/simulator/", require("./simulatorSolution"))

module.exports = app;
