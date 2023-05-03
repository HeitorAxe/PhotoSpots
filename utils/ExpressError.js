//Our very own custom error class
//Express is able to handle errors that has the
//statusCode and message attributes
//usually they wouldnt have statusCode, but express allows us
//to create an error class with that attribute and send it to the user
class ExpressError extends Error{
    constructor(message, statusCode){
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

//Exporting
module.exports = ExpressError;