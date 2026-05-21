const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    relation: { type: String }, // Dad, Mom, Son
    gender: { type: String, enum: ["male", "female", "other"] },
    age: { type: Number }
}, { _id: false });

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },


    name: {
        type: String
    },

    // password removed for OTP-based auth

    role: {
        type: String,
        enum: ["CUSTOMER", "BARBER", "ADMIN"],
        default: "CUSTOMER"
    },

    // only for BARBER users
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
    },

    // new: link to Shop (kept for newer code that expects `shop` field)
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        default: null
    },

    familyMembers: [familyMemberSchema],

    priorityScore: {
        type: Number,
        default: 100
    },

    subscription: {
        active: { type: Boolean, default: false },
        plan: { type: String }, // monthly
        expiry: { type: Date }
    },

    // COD restriction: if set, user cannot choose COD until this date (inclusive)
    codRestrictedUntil: {
        type: Date,
        default: null
    },

    // Gender preference for shop filtering (CUSTOMER only)
    genderPreference: {
        type: String,
        enum: {
            values: ["MALE", "FEMALE", "UNISEX"],
            message: "{VALUE} is not a valid gender preference"
        },
        sparse: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);