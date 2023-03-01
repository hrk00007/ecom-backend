const express = require("express");
const router = express.Router();
const {check, validator, validationResult} = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
const authenticate = require("../middleware/authenticate");
//---------------------------------------------------------------------------------------------------------------------------------------------------------
/* 
    ROLE: 1. Register A Users
    URL: /user/register
    FIELDS: name, email, password
    METHOD: POST
    ACCESS: public
*/
router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty(),
    check("email", "Email is required").isEmail(),
    check("password", "Enter a proper password").isLength({min: 6}),
  ],
  async (request, response) => {
    //Register Logic
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({errors: errors.array()});
    }
    try {
      //read the form data
      let {name, email, password} = request.body;
      //user already registered or not
      let user = await User.findOne({email: email});
      if (user) {
        return response
          .status(400)
          .json({errors: [{errorMessage: "User already registered"}]});
      }
      //encode the password with bcrypt
      let salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      //avatar image for email
      let avatar = await gravatar.url(email, {
        s: "200",
        r: "G",
        d: "mm",
      });
      //address of user
      let address = {
        flat: " ",
        street: " ",
        landmark: " ",
        city: " ",
        state: " ",
        country: " ",
        pincode: " ",
        mobile: " ",
      };

      //insert into database
      user = new User({name, email, password, avatar, address});
      user = await user.save();
      return response.status(200).json({
        result: "success",
        user: user,
      });
    } catch (error) {
      return response.status(500).json({errors: [{msg: "Server Error"}]});
    }
  }
);
//---------------------------------------------------------------------------------------------------------------------------------------------------------
/* 
    ROLE: 2. Login A User
    URL: /user/login
    FIELDS: email, password
    METHOD: POST
    ACCESS: PUBLIC
*/
router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Enter a proper password").isLength({min: 6}),
  ],
  async (request, response) => {
    //login  Logic
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({errors: errors.array()});
    }
    try {
      //read the form data
      let {email, password} = request.body;
      //user already registered or not
      let user = await User.findOne({email: email});
      if (!user) {
        return response
          .status(401)
          .json({errors: [{errorMessage: "Invalid Credentials"}]});
      }
      //veirfy the password
      let isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return response
          .status(401)
          .json({errors: [{errorMessage: "Invalid Credentials"}]});
      }
      //create a token and send to client
      let payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(payload, process.env.JWT_SECRET_KEY, (err, token) => {
        if (err) throw err;
        return response
          .status(200)
          .json({result: "Login Success", token: token});
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({errors: [{msg: "Server Error"}]});
    }
  }
);
//---------------------------------------------------------------------------------------------------------------------------------------------------------
/* 
    ROLE: 3. Get A User
    URL: /user/
    FIELDS: no fields
    METHOD: GET
    ACCESS: PRIVATE
*/
router.get("/", authenticate, async (request, response) => {
  //Get User Info Logic
  try {
    let user = await User.findById(request.user.id).select("-password");
    response.status(200).json(user);
  } catch (error) {
    console.log(error);
    return response.status(500).json({errors: [{msg: "Server Error"}]});
  }
});

//---------------------------------------------------------------------------------------------------------------------------------------------------------
/* 
    ROLE: 4. Update  A User Address
    URL: /user/address
    FIELDS: flat street landmark city state country pincode mobile
    METHOD: POST
    ACCESS: PRIVATE
*/
router.post(
  "/address",
  [
    check("flat", "Flat/House Number is required").notEmpty(),
    check("street", "Street is required").notEmpty(),
    check("landmark", "Landmark is required").notEmpty(),
    check("city", "City is required").notEmpty(),
    check("state", "State  is required").notEmpty(),
    check("country", "Country is required").notEmpty(),
    check("pincode", "Pincode/Zip is required").notEmpty(),
    check("mobile", "Mobile Number is required").notEmpty(),
  ],
  authenticate,
  async (request, response) => {
    //Update Address Logic
    let errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(401).json({errors: errors.array()});
    }
    try {
      //get the form data
      let address = {
        flat: request.body.flat,
        street: request.body.street,
        landmark: request.body.landmark,
        city: request.body.city,
        state: request.body.state,
        country: request.body.country,
        pincode: request.body.pincode,
        mobile: request.body.mobile,
      };
      //get the user id
      let user = await User.findById(request.user.id);
      //update the user address
      user.address = address;
      user = await user.save();
      // return response.status(200).json({
      //   result: "success",
      //   user: user,
      // });
      return response.status(200).json(user);
    } catch (error) {
      console.log(error);
      return response.status(500).json({errors: [{msg: "Server Error"}]});
    }
  }
);

module.exports = router;
