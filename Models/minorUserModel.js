const { ObjectId } = require('bson');
let mongoose=require('mongoose')
const minorUserSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    dob:{
        type:Date,
    },
    primaryMemberId:{
        type:ObjectId,
        ref:'minoruser'
    },
    relation:{
        type:String,
    }
},{timestamps:true})

const minorUser=mongoose.model("minoruser",minorUserSchema)

module.exports=minorUser;