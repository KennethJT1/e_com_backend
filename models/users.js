import mongoose, { Schema, model } from 'mongoose'

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        min: 6,
        max: 250,
        required: true
    },
    address: {
        type: String,
        trim: true
    },
    role: {
        type: Number,
        default: 0
    },
},{
    timestamps: true
});

export default model("User", userSchema);