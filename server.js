require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const storeItems = require("./storeItems");

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL }));

app.post("/checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.items.map((item) => {
        const storeItem = storeItems.get(+item.id);
        return {
          price_data: {
            currency: "gbp",
            product_data: {
              name: storeItem.name,
              description: `Size ${item.size}`,
            },
            unit_amount: storeItem.priceInPence,
          },
          quantity: 1,
        };
      }),
      success_url: process.env.CLIENT_URL,
      cancel_url: `${process.env.CLIENT_URL}/basket`,
    });
    return res.json({ url: session.url });
  } catch (e) {
    res.json({ error: e.message });
  }
});

app.listen(process.env.PORT);
