const mongoose = require('mongoose')
const { Schema } = mongoose

const FileSchema = new Schema({
    'InputName' : {
        type : String,
        required : true
    },
    'OutputName' : {
        type : String,
        required : true
    },
    'Status' : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('filesStatus', FileSchema)