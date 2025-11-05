let mongoose=require('mongoose')
const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  deviceType: { type: String, enum: ['mobile', 'tablet', 'web', 'other'], default: 'mobile' },
  lastSync: { type: Date, default: null },
  lastActive: { type: Date, default: Date.now },
}, { _id: false }); // _id false because we don’t need separate IDs for embedded docs

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
    },
    devices: [deviceSchema],
},{timestamps:true})

const user=mongoose.model("user",userSchema)

module.exports=user;