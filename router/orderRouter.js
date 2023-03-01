const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {check, validator, validationResult} = require("express-validator");
const Order = require("../models/Order");
const User = require("../models/User");
/*
    	1. To Place an Order
        URL	/order/
        Fields	items , tax , total
        Method	POST
        Access	PRIVATE

 */
router.post(
  "/",
  [
    check("items", "Please provide items").notEmpty(),
    check("tax", "Please provide tax").notEmpty(),
    check("total", "Please provide Total").notEmpty(),
  ],
  authenticate,
  async (request, response) => {
    // To Place an Order logic
    //1. check the order data is available form request or not
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }

    try {
      //2. get the user data from database using id
      let user = await User.findById(request.user.id);
      let {items, tax, total} = request.body;
      //3, create a new Order object to save
      let order = new Order({
        name: user.name,
        email: user.email,
        mobile: user.address.mobile,
        items: request.body.items,
        tax: request.body.tax,
        total: request.body.total,
      });
      order = await order.save();
      return response.status(201).json({result: "success", order: order});
    } catch (error) {
      console.log(error);
      return response
        .status(500)
        .json({errors: [{errorMessage: "Server Error"}]});
    }
  }
);

/*
    2. To Get All Orders
    URL	/order
    Fields	No-fields
    Method	GET
    Access	PRIVATE
 */
router.get("/", authenticate, async (request, response) => {
  // To Get All Orders	Logic
  try {
    let orders = await Order.find();
    return response.status(200).json({orders: orders});
  } catch (error) {
    console.log(error);
    return response
      .status(500)
      .json({errors: [{errorMessage: "Server Error"}]});
  }
});

//get all order using email

module.exports = router;
