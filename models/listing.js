const  mongoose = require('mongoose');
const { type } = require('../schema');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type: String
    },
    description:{
        type:String
    },
    image:{
        filename:String,
        url:String
    },

    price:{
        type:Number
    },
    location:{
        type:String
    },
    country:{
        type:String
    },
        owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
})

const Listing = mongoose.model("Listing",listingSchema);

module.exports = Listing;
