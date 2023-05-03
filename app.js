const express = require('express');
const path = require("path");
const mongoose = require('mongoose');
//ejs tool for we'll use for importing templates
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Spot = require('./models/spot');
//Importing unction that should be used for wrapping async routes that
//may result in errors
const wrapAsync = require('./utils/wrapAsync');
//Importing our custom error class
const ExpressError = require("./utils/ExpressError");
//We will use this to check if the data in a form that was sent is valid
const Joi = require('joi');

//setting up db connection
mongoose.connect('mongodb://localhost:27017/photo-spot',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection: "));
db.once("open", ()=>{
    console.log("Database Connected");
})

//Setting up express app
const app = express();
//setting for us to use ejs mate so we can use templating etc 
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}))
//so we can get other kinds of request from html form, check the edit.ejs to
//see how to override
app.use(methodOverride("_method"))


//cool middleware function to validate data from server side
//should be used on requests related to sending data to create/edit a spot
const validateSpot = (req, res, next) =>{
    //making a joi schema to check if the information in the form sent was correct using Joi
    //this is different from the mongoose validation, since it validates the data sent not only
    //from the forms but also from tools like postman and etc
    //This is very different from a mongoose schema btw
    //maybe not so much but they're not the same
    const spotSchema = Joi.object({
        spot: Joi.object({
            title:Joi.string().required(),
            hasPrice: Joi.boolean().required(),
            price:Joi.number().min(0),
            image:Joi.string(),
            location:Joi.string().required(),
            description:Joi.string().required(),
            category: Joi.string()//should change to required after adjusting seeding
        }).required(),

    });

    //handling the hasPrice Boolean that is beeing sent as a
    //string
    if(!req.body.spot.hasPrice){
        req.body.spot.hasPrice = false;
    }else{
        req.body.spot.hasPrice = true;
    }

    //handling when price comes as an empty string (when it is not)
    if(req.body.spot.price == ''){
        delete req.body.spot.price;
    }

    //actually validating here
    const {error} = spotSchema.validate(req.body);

    //if there was a validation error
    if(error){
        //dark magic or smth
        //mapping to a string
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}


//Routes
//Home
app.get('/' ,(req, res)=>{
    res.render('home');
});

//Index
app.get('/spots' , wrapAsync(async (req, res)=>{
    const spots = await Spot.find();
    res.render('spots/index', {spots});
}));


//create spot
app.get('/spots/new', wrapAsync((req, res)=>{
    res.render('spots/new');
}));
//creating
app.post('/spots',validateSpot, wrapAsync(async (req, res)=>{
    const spot = new Spot(req.body.spot);
    if(!spot.hasPrice){
        spot.hasPrice = false;
    }
    else{
        spot.hasPrice = true;
    }
    await spot.save();
    res.redirect(`/spots/${spot._id}`);
}));


//Show details of a spot
app.get('/spots/:id', wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const spot = await Spot.findById(id);
    res.render('spots/details', {spot});
}));

//Edit spot
app.get('/spots/:id/edit', wrapAsync(async (req, res)=>{
    const {id} = req.params;
    const spot = await Spot.findById(id);
    res.render('spots/edit', {spot});
}));
app.put('/spots/:id', validateSpot, wrapAsync(async (req, res)=>{
    const {id} = req.params;
    //the ... makes it so the data from the req.body.spot is evenly distributed to an object
    const spot = await Spot.findByIdAndUpdate(id, {...req.body.spot}, {new: true});
    res.redirect(`/spots/${spot._id}`);
}));


//delete spot operation
app.delete('/spots/:id', wrapAsync(async(req, res)=>{
    const {id} = req.params;
    const deletedSpot = await Spot.findByIdAndDelete(id);
    res.redirect('/spots');
}));


//this is a 404 handler
//remember that this should be after all other requests
//except error handler, since it should appear if no request matches
//the one the user wants.
//app.all means all requests
app.all("*", (req, res, next)=>{
    next(new ExpressError('Page Not Found', 404))
});


//Our error handler, any error will come to this route
app.use((err, req, res, next)=>{
    //gives us default code of 500
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Something went wrong'
    //passing error info for error page
    res.status(statusCode).render("error", {err});

});


//setting up port connection
app.listen(3000, ()=>{
    console.log("Listening on port 3000");
})