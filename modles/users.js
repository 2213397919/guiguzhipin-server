const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        unique: true
    },
    type :{
        type: String,
        required: true,
    },
    header: String,
    post :String,
    company :String,
    salary:String,
    info:String

});
module.exports = mongoose.model('users',usersSchema);