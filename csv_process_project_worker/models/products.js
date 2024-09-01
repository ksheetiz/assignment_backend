const mongoose = require('mongoose')
const { Schema } = mongoose

const ProductSchema = new Schema({
    'S. No' : {
        type : String,
        required : true
    },
    'Product Name' : {
        type : String,
        required : true
    },
    'Input Image Urls' : {
        type : String
    },
    'Output Image Urls' : {
        type : String
    },
})

module.exports = mongoose.model('products', ProductSchema)
