import slugify from "slugify";
import Category from "../models/category.js";
import Product from "../models/product.js";

export const create = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name.trim()) {
      return res.json({ error: "Name is required" });
    }

    //Check for existing categoty
    const existingCategoty = await Category.findOne({ name });

    if (existingCategoty) {
      return res.json({ error: "Already exist" });
    }

    //create a new category
    const category = await new Category({
      name,
      slug: slugify(name),
    });
    category.save();
    return res.json(category);
  } catch (error) {
    return res.status(400).json(error);
  }
};

// update category
export const update = async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId } = req.params;

    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        slug: slugify(name),
      },
      { new: true }
    );
    return res.json(category);
  } catch (error) {
    return res.status(400).json(error);
  }
};

//remove category
export const remove = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const remove = await Category.findByIdAndDelete(categoryId);
    return res.json(remove);
  } catch (error) {
    return res.status(400).json(error);
  }
};

//get all category
export const list = async (req, res) => {
  try {
    const all = await Category.find({});
    return res.json(all);
  } catch (error) {
    return res.status(400).json(error);
  }
};

//get single category
export const read = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    return res.json(category);
  } catch (error) {
    return res.status(400).json(error);
  }
};

export const productByCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    const products = await Product.find({ category }).populate("category");

    return res.json({ category, products });
  } catch (error) {
    return res.status(400).json(error);
  }
};
