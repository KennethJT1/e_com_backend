import Product from "../models/product.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";
import Order from "../models/order.js";
import sgMail from "@sendgrid/mail";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_KEY);

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//Crete product
export const create = async (req, res) => {
  try {
    // console.log(req.fields)
    // console.log(req.files)
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });

      case !description:
        return res.json({ error: "Description is required" });

      case !price:
        return res.json({ error: "Price is required" });

      case !category:
        return res.json({ error: "Category is required" });

      case !quantity:
        return res.json({ error: "Quantity is required" });

      case !shipping:
        return res.json({ error: "Name is required" });

      //Don't want to make photo compulsory and if upload, it should not be more than 1megabyte
      case photo && photo.size > 1000000:
        res.json({ error: "Image should not be more than 1 megabyte" });
    }

    //create product
    const product = new Product({ ...req.fields, slug: slugify(name) });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    return res.json(product);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

//Get all the product
export const list = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    return res.json({ Count: products.length, products });
    // res.json(products);
  } catch (error) {
    console.log(error);
  }
};

//Get single product without photo
export const read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    return res.json(product);
  } catch (error) {
    console.log(error);
  }
};

//Get product with photo
export const photo = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "photo"
    );

    //Since its not all product that will have photo
    if (product.photo.data) {
      res.set("content-Type", product.photo.contentType);
      return res.send(product.photo.data);
    }
    return res.json(product);
  } catch (error) {
    console.log(error);
  }
};

//Delete a product
export const remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.productId
    ).select("-photo");
    res.json({ msg: "Product deleted successfully", product });
  } catch (error) {
    console.log(error);
  }
};

//Update a product
export const update = async (req, res) => {
  try {
    // console.log(req.fields)
    // console.log(req.files)
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name.trim():
        res.json({ error: "Name is required" });

      case !description:
        res.json({ error: "Description is required" });

      case !price:
        res.json({ error: "Price is required" });

      case !category:
        res.json({ error: "Category is required" });

      case !quantity:
        res.json({ error: "Quantity is required" });

      case !shipping:
        res.json({ error: "Name is required" });

      //Don't want to make photo compulsory and if upload, it should not be more than 1megabyte
      case photo && photo.size > 1000000:
        res.json({ error: "Image should not be more than 1 megabyte" });
    }

    //update product
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    return res.json(product);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

//filtered products
export const filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};

    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    console.log("args=> ", args);

    const products = await Product.find(args);
    return res.json(products);
  } catch (err) {
    console.log(err);
  }
};

export const productsCount = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount();
    return res.json(total);
  } catch (error) {
    console.log(error);
  }
};

export const listProducts = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const products = await Product.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    return res.json(products);
  } catch (error) {
    console.log(error);
  }
};

export const productsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).select("-photo");

    return res.json(results);
  } catch (error) {
    console.log(error);
  }
};

export const relatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;

    const related = await Product.find({
      category: categoryId,
      //to remove the productviewed from related products
      _id: { $ne: productId },
    })
      .select("-photo")
      .populate("category")
      .limit(3);

    return res.json(related);
  } catch (err) {
    console.log(err);
  }
};

export const getToken = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        return res.status(500).send(err);
      } else {
        return res.send(response);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

export const procesPayment = async (req, res) => {
  try {
    // console.log(req.body);
    const { nonce, cart } = req.body;

    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    // console.log("total => ", total);

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          // res.send(result);
          // create order
          const order = new Order({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          // decrement quantity
          decrementQuantity(cart);

          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const decrementQuantity = async (cart) => {
  try {
    // build mongodb query
    const bulkOps = cart.map((item) => {
      return {
        updateOne: {
          filter: { _id: item._id },
          update: { $inc: { quantity: -0, sold: +1 } },
        },
      };
    });

    const updated = await Product.bulkWrite(bulkOps, {});
    console.log("blk updated", updated);
  } catch (err) {
    console.log(err);
  }
};

export const orderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("buyer", "email name");
    // send email

    // prepare email
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: order.buyer.email,
      subject: "Order status",
      html: `
        <h1>Hi ${order.buyer.name}, Your order's status is: <span style="color:cyan;">${order.status}</span></h1>
        <p>Visit <a href="${process.env.CLIENT_URL}/dashboard/user/orders">your dashboard</a> for more details</p>
      `,
    };

    try {
      await sgMail.send(emailData);
    } catch (err) {
      console.log(err);
    }

    res.json(order);
  } catch (err) {
    console.log(err);
  }
};
