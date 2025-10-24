let mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
    },
    phoneNumber:{
        type:String,
    },
    role: { 
        type: String, 
        enum: ['primary', 'minor'], 
        default: 'primary' 
    },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    minorMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: {
        type:Boolean,
        default:false
    },
    password:{
        type:String
    },
     dob:{
        type:Date,
    },
     relation:{
        type:String,
    }
},{timestamps:true})

const user=mongoose.model("user",userSchema)

module.exports=user;