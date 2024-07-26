const mongoose = require("mongoose")
const localMongoose = require("passport-local-mongoose")
const Schema = mongoose.Schema;


const userSchema = new Schema({
    email:{
        type:String,
    },
})

userSchema.plugin(localMongoose)

module.exports = mongoose.model("User",userSchema);