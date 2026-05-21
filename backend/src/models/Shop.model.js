const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true }, // barber price
    duration: { type: Number, required: true }, // minutes
    category: { type: String } // haircut, facial etc
});

const shopSchema = new mongoose.Schema({
    name: { type: String, required: true },

    type: {
        type: String,
        enum: ["MALE", "FEMALE", "UNISEX"],
        default: "UNISEX",
        description: "Shop type: MALE (barber shops), FEMALE (salons), UNISEX (mixed services)"
    },

    phone: String,
    address: String,

    services: [serviceSchema],

    openingTime: String, // "10:00"
    closingTime: String, // "20:00"

    slotBuffer: {
        type: Number,
        default: 5 // minutes
    },

    depositRequired: {
        type: Boolean,
        default: false
    },

    depositAmount: {
        type: Number,
        default: 0
    },

    acceptCOD: {
        type: Boolean,
        default: true
    },

    chairs: {
        type: Number,
        default: 1,
        min: 1,
        description: "Number of chairs/capacity for simultaneous bookings"
    },

    payoutDetails: {
        upiId: String,
        bankAccount: String
    },

    rating: {
        type: Number,
        default: 4.5
    },

    active: {
        type: Boolean,
        default: true
    },

    // Platform fee toggle: if false, platform collects ₹0 from this shop
    collectPlatformFee: {
        type: Boolean,
        default: true,
        description: "Whether platform fee should be charged to this shop. Useful for promotions/partnerships."
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Shop", shopSchema);