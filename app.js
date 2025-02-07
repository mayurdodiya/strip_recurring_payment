var express = require("express");
var bodyParser = require("body-parser");
require("dotenv").config();
const secrateKey = "sk_test_51Qfzo3P9sRZP42ZeLTaEKp9V4Wyrsa2sNod6WLtYnbh81wlMRhx2hl4NDZqAGsKJixN7OqkgnVFByFdfESaRjS3F003JMZq8gH";
const publishKey = "pk_test_51Qfzo3P9sRZP42ZezAgwsiu43XdjSfQEbhZV4t8EdOVdujC5hKHrTuzW2xz4oJne0Sb7PrWv8ZQ4iGHpV9Vnhztt00PLhAEvIG";
const stripe = require("stripe")(secrateKey);
const endpointSecret = "whsec_JwTjow8XL9DvZ6PcqekiFDeC0kRNinkk";
var app = express();
app.use(
  "/user/webhook",
  express.raw({ type: "application/json" }),
  require("./app/controller/users/users.controller").webhook
  // (request, response) => {
  //   let event = request.body;
  //   // Only verify the event if you have an endpoint secret defined.
  //   // Otherwise use the basic event deserialized with JSON.parse
  //   if (endpointSecret) {
  //     // Get the signature sent by Stripe
  //     const signature = request.headers["stripe-signature"];
  //     try {
  //       event = stripe.webhooks.constructEvent(
  //         request.body,
  //         signature,
  //         endpointSecret
  //       );
  //     } catch (err) {
  //       console.log(`⚠️  Webhook signature verification failed.`, err.message);
  //       return response.sendStatus(400);
  //     }
  //   }

  //   // Handle the event
  //   switch (event.type) {
  //     case "payment_intent.succeeded":
  //       const paymentIntent = event.data.object;
  //       console.log(
  //         `PaymentIntent for ${paymentIntent.amount} was successful!`
  //       );
  //       // Then define and call a method to handle the successful payment intent.
  //       // handlePaymentIntentSucceeded(paymentIntent);
  //       break;
  //     case "payment_method.attached":
  //       const paymentMethod = event.data.object;
  //       // Then define and call a method to handle the successful attachment of a PaymentMethod.
  //       // handlePaymentMethodAttached(paymentMethod);
  //       break;
  //     default:
  //       // Unexpected event type
  //       console.log(`Unhandled event type ${event.type}.`);
  //   }

  //   // Return a 200 response to acknowledge receipt of the event
  //   response.send();
  // }
);
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.raw({ type: "application/json" }));

app.get("/", function (req, res) {
  res.send("Hello World");
});

const db = require("./app/models");
// db.sequelize.sync();

const userRouter = require("./app/routes/users.routes");
app.use(userRouter);

var PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}!`);
});
