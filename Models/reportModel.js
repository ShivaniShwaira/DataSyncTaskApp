const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name:{type:String},
    fileName: { type: String, required: true },
    filePath: { type: String, required: true }, // local or S3 URL
    fileType: { type: String }, // pdf, jpg, etc.
    size: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relatedTo: { 
        type: String, 
        enum: ['medicine', 'appointment', 'general'], 
        default: 'general' 
    },
    version: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    deviceId: { type: String },
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);
module.exports = Document;
