import { Schema, model } from "mongoose";

const categorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        unique: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    }
});

export default model('Category', categorySchema);