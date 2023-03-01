const express = require("express");
const app = express();
const cors = require("cors");
const dotEnv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

//configure cors for port communication
app.use(cors());

//cofigure express to accept json data
// app.use(express.json());
// app.use(express.urlencoded({extended: false}));

app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb"}));

//configure dotEnv
dotEnv.config({path: "./config/config.env"});

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_CLOUD_URL)
  .then(() => {
    console.log("Connected to Mongo Db Successfully...... ");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1); //stops the nodejs process
  });

// for React Application Home Page
app.use(express.static(path.join(__dirname, "client", "build")));
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("/", (request, response) => {
    response.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

//router configuration
app.use("/user", require("./router/userRouter"));
app.use("/product", require("./router/productRouter"));
app.use("/order", require("./router/orderRouter"));
app.use("/payment", require("./router/paymentRouter"));

//listen on port
app.listen(port, () => {
  console.log("Express Server Started ......");
});
