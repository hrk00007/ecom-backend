const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/*
    	1. Accept Stripe Payments
        URL	/payment/pay
        Fields	Product , token
        Method	POST
        Access	PRIVATE
 */
router.post("/pay", (request, response) => {
  const {product, token} = request.body;
  stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) =>
      stripe.charges.create({
        amount: product.price,
        description: product.name,
        currency: "USD",
        customer: customer.id,
      })
    )
    .then((charge) => response.status(200).json(charge))
    .catch((err) => console.log(err));
});
//

module.exports = router;
