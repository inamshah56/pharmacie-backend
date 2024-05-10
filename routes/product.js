var express = require("express");
var Controller = require("../controllers/index");
var router = express.Router();

router.post("/add",Controller.ProductController.addProduct);
router.get("/listings",Controller.ProductController.getProductLisings);
router.post("/listings",Controller.ProductController.filterProductLisings);
router.get("/my",Controller.ProductController.getMyProduct);
router.get("/user/:id",Controller.ProductController.getUserProduct);
router.get("/delete/:id",Controller.ProductController.deleteProduct);
router.get("/details/:id",Controller.ProductController.getProducDetails);
router.post("/search",Controller.ProductController.search);
router.post("/request",Controller.ProductController.requestProduct);
router.post("/bid",Controller.ProductController.biddingProduct);
router.get("/requests",Controller.ProductController.productRequests);
router.get("/bidders",Controller.ProductController.productBidders);
router.get("/analytic",Controller.ProductController.analyticProduct);

module.exports = router;