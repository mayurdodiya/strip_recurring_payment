const db = require("./../../models");
const geoGraphicalDistance = require("./../../services/geoGraphicalDistance");
const RazorPayDocs = require("./../../services/razorPay");
var logger = require("./../../services/logger");
const crypto = require("crypto");
const secrateKey = "sk_test_51Qfzo3P9sRZP42ZeLTaEKp9V4Wyrsa2sNod6WLtYnbh81wlMRhx2hl4NDZqAGsKJixN7OqkgnVFByFdfESaRjS3F003JMZq8gH";
const publishKey = "pk_test_51Qfzo3P9sRZP42ZezAgwsiu43XdjSfQEbhZV4t8EdOVdujC5hKHrTuzW2xz4oJne0Sb7PrWv8ZQ4iGHpV9Vnhztt00PLhAEvIG";
const stripe = require("stripe")(secrateKey); // Use your test/live secret key

const endpointSecret = "whsec_JwTjow8XL9DvZ6PcqekiFDeC0kRNinkk";
const Users = db.users;

module.exports = {
  // create payment for continue recurring(autocut) payment for plan and subscription
  createSubscriptionAndPlan: async (req, res) => {
    try {
      // // Create a new customer
      // const customer = await stripe.customers.create({
      //   email: "customer@yopmail.com",
      //   source: "tok_visa", // a valid token for the payment method
      // });

      // const subscription = await stripe.subscriptions.create({
      //   customer: customer.id,
      //   items: [
      //     {
      //       price: "price_1QghmLP9sRZP42ZegwM8hl6f", // The price ID of the product plan
      //     },
      //   ],
      //   // trial_period_days: 7, // Optional: Set trial period
      // });
      // console.log(subscription,'------------------------------------------------- subscription');

      // // Create subscription schedule based on session data
      // const schedule = await stripe.subscriptionSchedules.create({
      //   customer: event?.data?.object?.customer, // Use the customer from the session
      //   start_date: Math.floor(Date.now() / 1000), // Start immediately
      //   end_behavior: "cancel", // Optionally cancel after the schedule ends
      //   phases: [
      //     {
      //       items: [
      //         {
      //           price: session.display_items[0].custom.price.id, // Use the price ID from the session
      //           quantity: 1,
      //         },
      //       ],
      //       iterations: 10, // Set the number of billing cycles
      //     },
      //   ],
      // });

      // console.log("Subscription schedule created:", schedule);

      // Create a Checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"], // Payment method types (cards)
        line_items: [
          {
            price: "price_1QghmLP9sRZP42ZegwM8hl6f", // Price ID of the subscription plan (e.g., monthly or yearly)
            quantity: 1,
          },
        ],
        mode: "subscription", // Subscription mode
        customer_email: "customer@yopmail.com", // Optional: Pre-fill customer email
        success_url: "https://w07j0hbp-4000.inc1.devtunnels.ms", // Redirect URL after successful payment
        cancel_url: "https://your-site.com/cancel", // Redirect URL if payment is canceled
      });
      console.log(session, "------------------------------------------------- session");

      // console.log(session,'----------------------------- session');
      return res.status(200).json({ success: true, data: session });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // create payment link for one time payment
  createPaymentLink: async (req, res) => {
    try {
      // normal payment ---------------------------
      // const paymentIntent = await stripe.paymentIntents.create({
      //     amount: 100, // Amount in cents
      //     currency: 'usd',
      //   });
      //   console.log('Payment Intent created:', paymentIntent);

      // create payment link ----------------------
      const product = await stripe.products.create({
        name: "T-shirt",
        description: "Comfortable cotton t-shirt",
      });

      // Create a price for the product
      const price = await stripe.prices.create({
        unit_amount: 100, // Price in cents (e.g., 2000 cents = $20.00)
        currency: "usd",
        product: product.id,
      });

      // Create a payment link
      const paymentLink = await stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1, // Adjust the quantity as needed
          },
        ],
      });

      return res.status(500).json({
        success: true,
        message: "payment created successfully",
        data: paymentLink,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "payment link not created successfully",
      });
    }
  },

  // cancle subscrition
  cancleSubscrition: async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(500).json({
        success: false,
        message: "payment link not created successfully",
      });
    }
  },

  // refund
  refund: async (req, res) => {
    try {
    } catch (error) {
      console.log(error);
      logger.error(error);
      return res.status(500).json({
        success: false,
        message: "payment link not created successfully",
      });
    }
  },

  // handle post payment event
  webhook: async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      console.log(req.body, "--------------------------- sig");
      let event = req.body;
      let eventNew = req.body;
      const webhookSecret = "whsec_JwTjow8XL9DvZ6PcqekiFDeC0kRNinkk";

      // Verify the webhook signature and parse the event
      // event = await stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      eventNew = await stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

      // console.log(event.data, "--------------------------- data");
      console.log(event.data.object, "--------------------------- object");
      console.log(eventNew, "--------------------------- eventNew");
      // console.log(event.data.object.customer, "--------------------------- object");

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object; // The payment intent object
          console.log(`PaymentIntent was successful for amount: ${paymentIntent.amount_received / 100} ${paymentIntent.currency.toUpperCase()}`);
          // Here, you can notify the merchant or update their system
          break;

        case "payment_intent.payment_failed":
          const failedPayment = event.data.object; // The failed payment object
          console.log(`PaymentIntent failed for reason: ${failedPayment.last_payment_error.message}`);
          // Handle failed payment logic (e.g., notify merchant)
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Respond to Stripe to acknowledge receipt of the event
      res.status(200).send("Event received");
    } catch (err) {
      console.log(err);
      res.status(400).send(`Webhook error: ${err.message}`);
    }
  },
};
