const mongoose = require("mongoose");

let ProductSchema = mongoose.Schema({
  name: {type: String, required: true},
  brand: {type: String, required: true},
  image: {type: String, required: true},
  price: {type: Number, required: true},
  qty: {type: Number, required: true},
  category: {type: String, required: true},
  description: {type: String, required: true},
  usage: {type: String, required: true},
  created: {type: Date, default: Date.now()},
});

let Product = mongoose.model("product", ProductSchema);
module.exports = Product;
