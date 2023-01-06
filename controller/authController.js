import User from "../models/users.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import Order from "../models/order.js";

//Register user
export const register = async (req, res) => {
  try {
    //destructure req.body
    const { name, email, password } = req.body;

    //all field require validation
    if (!name.trim()) {
      return res.json({ error: "Name is required" });
    }

    if (!email) {
      return res.json({ error: "Email is taken" });
    }

    if (!password || password.length < 6) {
      return res.json({ error: "Password must be at least 6 character" });
    }

    //check if email exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ error: "Email already exist" });
    }

    //hash password
    const hashpassword = await hashPassword(password);

    const user = await new User({
      name,
      email,
      password: hashpassword,
    });
    user.save();

    //create sign jwt
    const token = jwt.sign({ _id: user._id }, process.env.jwt_secret, {
      expiresIn: "7d",
    });

    //send response
    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    // res.status(500).json({
    //     Error: "Internal server Error",
    //     route: "/users/signup",
    //   });
    console.log(error);
  }
};

//login user
export const login = async (req, res) => {
  try {
    //destructure req.body
    const { email, password } = req.body;

    //all field require validation
    if (!email) {
      return res.json({ error: "Email is wrong" });
    }

    if (!password || password.length < 6) {
      return res.json({ error: "Password must be at least 6 character" });
    }

    //check if email exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User not found" });
    }

    //compare password
    const comparepassword = await comparePassword(password, user.password);

    if (!comparepassword) {
      return res.json({ error: "Wrong password" });
    }

    //create sign jwt
    const token = jwt.sign({ _id: user._id }, process.env.jwt_secret, {
      expiresIn: "7d",
    });

    //send response
    res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

export const secret = async (req, res) => {
  res.json("That's so great");
};

export const updateProfile = async (req, res) => {
  try {
    const { name, password, address } = req.body;
    const user = await User.findById(req.user._id);
    // check password length
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and should be min 6 characters long",
      });
    }
    // hash the password
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        address: address || user.address,
      },
      { new: true }
    );

    updated.password = undefined;
    res.json(updated);
  } catch (err) {
    console.log(err);
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (err) {
    console.log(err);
  }
};

export const allOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json(orders);
  } catch (err) {
    console.log(err);
  }
};
