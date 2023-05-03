const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SpotSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    image: String,
    hasPrice:{
        type: Boolean,
        required: true
    },
    price: Number,
    description: String,
    location:{
        type: String,
        required: true
    },
    category:{
        type: String,
    }
})


module.exports = mongoose.model('Spot', SpotSchema);



