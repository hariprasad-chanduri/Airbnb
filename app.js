
if(process.env.NODE_ENV !="production")
require('dotenv').config()

const express = require("express")
const app = express();
const path = require("path")
const port = 8080;
const mongoose = require('mongoose');
const Listing = require("./models/listing.js")
const ejs = require('ejs')
const methodOverride = require('method-override')
const ejsMate = require("ejs-mate")
const wrapasync = require("./utils/wrapasync.js")
const ExpressError = require("./utils/ExpressError.js")
const {listingSchema} = require("./schema.js")
const session = require("express-session")
const MongoStore = require('connect-mongo');
const flash = require("connect-flash")
const passport = require("passport")
const localStrategy = require("passport-local")
const User = require("./models/user.js")
 const userrouter = require("./routers/user.js")
  const{isLoggedIn} = require("./middleware.js")
  const multer  = require('multer')
  const {storage} = require("./cloudConfig.js")
const upload = multer({storage })

const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("mongoose is working successfully")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate)
app.use(express.static(path.join(__dirname,"/public")))

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto : {
        secret :process.env.SECRET,
    },
    touchAfter : 24 *3600,
});

store.on("error",()=>{
    console.log("Error occured in mongo session store",err);
});

const sessionOptions ={
    store,
    secret:process.env.SECRET,
     resave:false,
     saveUninitialized :true,
    Cookie:{
        expires:Date.now()+ 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
} ;

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error= req.flash("error");
    res.locals.currUser= req.user;
    next()
})

//data
app.get("/listings", wrapasync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listing/index.ejs",{allListings})
}))
//create

app.get("/listings/new",isLoggedIn,(req,res)=>{
    res.render("listing/create.ejs")
})

//show
app.get("/listings/:id", wrapasync(async(req,res)=>{
    let {id}=req.params;
  const listing = await Listing.findById(id).populate("owner");
  if(!listing){
    req.flash("error","listing is does't exist");
    res.redirect("/listings")
  }
  
  res.render("listing/show.ejs",{listing})
}))

//create
app.post("/listings",isLoggedIn, upload.single('listing[image]'),async(req,res)=>{
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id;
    newListing.image = {url,filename}
    await newListing.save();
    req.flash("success","listing is created  successfully")
    res.redirect("/listings");
    
})

//edit
app.get("/listings/:id/edit",isLoggedIn, wrapasync(async(req,res)=>{
    let {id} = req.params;
    const listing =await Listing.findById(id);
    if(!listing){
        req.flash("error","listing is does't exist");
        res.redirect("/listings")
      }
      let orginalImageUrl = listing.image.url;
      orginalImageUrl = orginalImageUrl.replace("/upload","/upload/w_250");
    res.render("listing/edit.ejs" ,{listing,orginalImageUrl})
}))

//update
 app.put("/listings/:id",isLoggedIn,upload.single('listing[image]'), wrapasync(async(req,res)=>{
    let {id} = req.params;
     let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing})
     if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename}
        await listing.save();
     }
    req.flash("success","listing is edited  successfully")
    res.redirect(`/listings/${id}`)
 }))

 //Delete

 app.delete("/listings/:id",isLoggedIn, wrapasync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id)
    req.flash("success","listing is deleted  successfully")

    res.redirect("/listings")
 }))
  app.use("/",userrouter)

 app.all("*",(req,res,next)=>{
    next(new ExpressError("404","page not found"))
 })

 app.use((err,req,res,next)=>{
    let {status=500,message="something went wrong "} = err;
    res.status(status).render("listing/error.ejs",{message})
    next()
 })

app.listen(port,()=>{
    console.log("app is listing");
})