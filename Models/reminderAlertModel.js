let mongoose=require('mongoose');
const { type } = require('os');
const reminderAlertSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    type:{
        type:String,
        enum: ['appointment', 'medicine'], 
        default: 'medicine' 
    },
    medicine:{
        type:String,
    },
    quantity:{
        type:Number
    },
    doctorName:{
        type: String   //in future there will be separate doctor model will keep reference here then
    },
    time:{
        type:String
    },
    date:{
        type:Date
    },
    version:{
        type:Number,
        default:1
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    deviceId: { type: String },
    isDeleted: {
        type:Boolean,
        default:false
    }
},{timestamps:true})

const reminderAlert=mongoose.model("reminderalert",reminderAlertSchema)

module.exports=reminderAlert;