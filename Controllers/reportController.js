const Document = require('../Models/reportModel');
const path = require('path');
const fs = require('fs');


module.exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const newDoc = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user._id.toString(), // normally from auth token
      relatedTo: req.body.relatedTo || 'general',
      deviceId: req.body.deviceId || null,
    });

    return res.status(201).json({ status: true,message: 'Document uploaded successfully', data: newDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error uploading document', error });
  }
};


module.exports.getDocuments = async (req, res) => {
  try {
    const {lastSync } = req.query;

    // const query = { uploadedBy: userId, isDeleted: false };

    // if (lastSync) {
    //   query.updatedAt = { $gt: new Date(lastSync) }; // only get new/updated docs
    // }
 let docList=[]
        if(!lastSync){
           docList = await Document.find({ uploadedBy: req.user._id.toString(),isDeleted:false});
        }else{
           docList = await Document.find({ uploadedBy: req.user._id.toString(),updatedAt: { $gt: lastSync },isDeleted:false});

        }
    // const docs = await Document.find(query).sort({ updatedAt: -1 });
    return res.status(200).send({ status: true, message: "Report List is here", data: docList })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching documents', error });
  }
};


module.exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({_id:req.query.id.toString(),isDeleted:false});
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    return res.download(path.resolve(doc.filePath));
  } catch (error) {
    res.status(500).json({ message:error.message, error });
  }
};


module.exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({_id:req.body.id.toString(),isDeleted:false});
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    doc.isDeleted = true;
    doc.version += 1;
    await doc.save();

    return res.status(200).json({ status: true,message: 'Document deleted successfully', document: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
};
