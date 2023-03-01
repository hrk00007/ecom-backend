const express = require("express");
const authenticate = require("../middleware/authenticate");
const router = express.Router();
const {check, validator, validationResult} = require("express-validator");
const Product = require("../models/Product");
const User = require("../models/User");
/* 
    ROLE: 1. Upload a Product
    URL: /product/upload
    FEILDS: name, brand, price, qty, image ,category ,description ,usage
    METHOD: POST
    ACCESS: PRIVATE
*/
router.post(
  "/upload",
  [
    check("name", "Product Name is Required").notEmpty(),
    check("brand", "Product Brand is Required").notEmpty(),
    check("price", "Product Price is Required").notEmpty(),
    check("qty", "Product Quantity is Required").notEmpty(),
    check("image", "Product Image is Required").notEmpty(),
    check("category", "Product Category is Required").notEmpty(),
    check("description", "Product Description is Required").notEmpty(),
    check("usage", "Product Info is Required").notEmpty(),
  ],
  //authenticate,
  async (request, response) => {
    //Upload A Product Logic
    //1. if any fields are empty send error response
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }
    try {
      //2. fetch the product data from request(form)
      let newProduct = {
        name: request.body.name,
        brand: request.body.brand,
        price: request.body.price,
        qty: request.body.qty,
        image: request.body.image,
        category: request.body.category,
        description: request.body.description,
        usage: request.body.usage,
      };
      //3. save the product to database
      let product = new Product(newProduct);
      product = await product.save();
      //4. return the response to client
      return response
        .status(201)
        .json({result: "product created successfully", product: product});
    } catch (error) {
      console.log(error);
      return response
        .status(500)
        .json({errors: [{errorMessage: "Server Error"}]});
    }
  }
);
//----------------------------------------------------------------------------------------------------------------------------------------------------
/* 
    ROLE: 2. Get a Mens Collection
    URL: /product/men
    FEILDS: 
    METHOD: GET
    ACCESS: public
*/
router.get("/men", async (request, response) => {
  //Men's Product  Logic
  try {
    let products = await Product.find({category: "MENS"});
    return response.status(200).json(products);
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({errors: [{errorMessage: "Server Error"}]});
  }
});
//----------------------------------------------------------------------------------------------------------------------------------------------------
/* 
    ROLE: 3. Get a Womens Collection
    URL: /product/women
    FEILDS: no fields
    METHOD: GET
    ACCESS: PRIVATE
*/
router.get("/women", async (request, response) => {
  //Women's Product  Logic
  try {
    let products = await Product.find({category: "WOMEN"});
    return response.status(200).json(products);
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({errors: [{errorMessage: "Server Error"}]});
  }
});
//----------------------------------------------------------------------------------------------------------------------------------------------------

/* 
    ROLE: 4. Get a Kids Collection
    URL: /product/kids
    FEILDS: no fields
    METHOD: POST
    ACCESS: PRIVATE
*/
router.get("/kids", async (request, response) => {
  //Women's Product  Logic
  try {
    let products = await Product.find({category: "KIDS"});
    return response.status(200).json(products);
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({errors: [{errorMessage: "Server Error"}]});
  }
});
//----------------------------------------------------------------------------------------------------------------------------------------------------
/*
    5. Get a Product
    URL	/product/:id
    Fields	No-fields
    Method	GET
    Access	PUBLIC

 */
router.get("/:id", async (request, response) => {
  try {
    let productId = request.params.id;
    let product = await Product.findById(productId);
    return response.status(200).json(product);
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({errors: [{errorMessage: "Server Error"}]});
  }
});

module.exports = router;
