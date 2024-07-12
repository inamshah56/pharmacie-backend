const apiResponse = require("../helpers/apiResponse");
let BuyerAuh = require("../middlewares/buyersAuth");
const toLowerCaseUtil = require("../helpers/toLowerCaseUtil")
const Models = require("../models");
const { Op, Sequelize, json, where } = require('sequelize');
const { Json } = require("sequelize/lib/utils");
const { sign } = require("jsonwebtoken");
const product = require("../models/product");


// ==================================================================================
//                                FUNCTIONS
// ==================================================================================

const checkProductAvailability = async (productId, locationKey, locationValue) => {
    const product = await Models.ListingProduct.findOne({
        where: {
            product_id: productId
        },
        attributes: ['address_id', 'product_id'],
        include: [
            {
                model: Models.User,
                as: 'user',
                attributes: ["id"],
                required: true,
                include: [
                    {
                        model: Models.Address,
                        as: 'address',
                        attributes: [],
                        required: true,
                        where: {
                            [Op.and]: [
                                { [locationKey]: locationValue },
                                {
                                    id: {
                                        [Op.in]: Sequelize.literal(`(
                                            SELECT unnest("ListingProduct"."address_id")
                                        )`)
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    });
    return product ? true : false;
}


// ==================================================================================
//                                CONTROLLERS
// ==================================================================================

exports.getAllSolutions = [
    async (req, res) => {
        try {
            const farmTehsil = req.query.tehsil;
            const farmDistrict = req.query.district;
            const farmProvince = req.query.province;

            if (!farmTehsil || !farmDistrict || !farmProvince) {
                return apiResponse.ErrorResponse(res, "tehsil, district, and province are required fields.");
            }

            const solutions = req.query.solutions;
            if (!solutions) {
                return apiResponse.ErrorResponse(res, "solutions is a required field.");
            }


            // Split solutions by ',' and '+' and getting unique product UIDs
            let solutionsUids = solutions.split(/[,|]/);
            const uniqueProductUIDs = Array.from(new Set(solutionsUids));


            // GETTING PRODUCTS NAME AND UID FROM PRODUCT TABLE FOR FURTHER AVAILABILITY CHECK
            let products = await Models.Product.findAll({
                where: {
                    uuid: {
                        [Op.in]: uniqueProductUIDs
                    }
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt']
                }
            });
            products = JSON.parse(JSON.stringify(products));



            // FETCHING THE PRODUCTS ACCORDING TO THEIR AVAILABILITY ON FARMACIE
            for (const product of products) {
                const availableInTehsil = await checkProductAvailability(product.id, 'tehsil', farmTehsil);
                if (availableInTehsil) {
                    product.availableLocation = "tehsil"
                    product.tehsil = farmTehsil;
                    continue;
                }

                const availableInDistrict = await checkProductAvailability(product.id, 'district', farmDistrict);
                if (availableInDistrict) {
                    product.availableLocation = "district"
                    product.district = farmDistrict;
                    continue;
                }

                const availableInProvince = await checkProductAvailability(product.id, 'province', farmProvince);
                if (availableInProvince) {
                    product.availableLocation = "province"
                    product.province = farmProvince;
                    continue;
                }
                else {
                    product.availableLocation = "none"
                }
            }

            // MAPPING THE PRODUCTS TO THE SOLUTIONS
            const solutionUidsList = solutions.split('|');
            let solutionsProductData = {};
            let solutionCount = 1;
            for (const solutionUids of solutionUidsList) {
                solutionsProductData["solution" + solutionCount] = [];
                const productUids = solutionUids.split(',');
                for (const productUid of productUids) {
                    for (const product of products) {
                        if (product.uuid === productUid) {
                            solutionsProductData["solution" + solutionCount].push(product);
                            break;
                        }
                    }
                }
                solutionCount++;
            }

            return apiResponse.successResponseWithData(res, "Solutions fetched successfully.", solutionsProductData);
        }
        catch (err) {
            console.error("Error in getAllSolutions:", err);
            return apiResponse.ErrorResponse(res, err.message || "Error in getAllSolutions");

        }
    }];

exports.getSingleSolution = [
    async (req, res) => {
        try {

            let { solutions } = req.query;
            if (!solutions) {
                return apiResponse.validationErrorWithData(res, "solutions is a required field.");
            }
            solutions = JSON.parse(solutions);


            // }
            /////////////////////////////////////////////////////////////////////////////////////
            let solutionAddresses = [];

            for (const product of solutions) {
                if (product.availableLocation !== "none") {
                    const locationKey = product.availableLocation;
                    const locationValue = product[locationKey];
                    const productAddresses = await Models.ListingProduct.findAll({
                        where: {
                            product_id: product.id
                        },
                        attributes: ['address_id', 'product_id', 'price'],
                        include: [
                            {
                                model: Models.User,
                                as: 'user',
                                attributes: ["id", "name", "phone"],
                                required: true,
                                include: [
                                    {
                                        model: Models.Address,
                                        as: 'address',
                                        required: true,
                                        attributes: {
                                            exclude: ['createdAt', 'updatedAt']
                                        },
                                        where: {
                                            [Op.and]: [
                                                { [locationKey]: locationValue },
                                                {
                                                    id: {
                                                        [Op.in]: Sequelize.literal(`(
                                                            SELECT unnest("ListingProduct"."address_id")
                                                        )`)
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                    const productData = {
                        id: product.id,
                        uuid: product.uuid,
                        addresses: JSON.parse(JSON.stringify(productAddresses))
                    }
                    solutionAddresses.push(productData);


                }
            }
            let responseData = [];
            for (const product of solutionAddresses) {
                productAddresses = {
                    id: product.id,
                    uuid: product.uuid,
                }
                productAddresses.addresses = [];
                const multiUserAdress = product.addresses;
                for (const userAdresses of multiUserAdress) {
                    for (let address of userAdresses.user.address) {
                        address.price = userAdresses.price;
                        address.sellerName = userAdresses.user.name;
                        address.sellerPhone = userAdresses.user.phone;
                        productAddresses.addresses.push(address)
                    }
                }
                responseData.push(productAddresses);
            }



            return apiResponse.successResponseWithData(res, "Product details fetched successfully", responseData);
        } catch (err) {
            console.error("Error in getSingleSolution:", err);
            return apiResponse.ErrorResponse(res, err.message || "Error in getSingleSolution");
        }
    }
];

