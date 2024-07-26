module.exports. isLoggedIn =(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
req.flash("error","You have to login")
return res.redirect("/login")
    }
    next();
}

module.exports.saveUrl =(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl= req.session.redirectUrl;
    }
    next()
}