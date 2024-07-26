const mongoose = require('mongoose');
const Listing = require("../models/listing.js")
const initData = require("./data.js")

main().then((res)=>{
    console.log("mongoose is working successfully")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/Airbnb');
}


const initDB = async()=>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj , owner:'669f5cbf79768b9aafab4d19'}) )
    await Listing.insertMany(initData.data)
    console.log("data was initilized");
};
initDB();