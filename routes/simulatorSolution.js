var express = require("express");
var Controller = require("../controllers/index");
var router = express.Router();

router.get("/all/solution", Controller.SimulatorController.getAllSolutions);
router.get("/single/solution", Controller.SimulatorController.getSingleSolution);

module.exports = router;