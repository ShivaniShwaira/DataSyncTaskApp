const Document = require('../Models/reportModel');
const path = require('path');
const fs = require('fs');
const userModel = require("../Models/userModel");

module.exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    let reportNameExist= await Document.findOne({name:req.body.name,isDeleted:false})
    if(reportNameExist!=null){
        return res.status(400).send({ status: false, message: "Entered Report Name is already exist" });
    }
    const newDoc = await Document.create({
      name:req.body.name,
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
     let deviceId = req.query.deviceId;
     let userId = req.user._id.toString();
    // const query = { uploadedBy: userId, isDeleted: false };

    // if (lastSync) {
    //   query.updatedAt = { $gt: new Date(lastSync) }; // only get new/updated docs
    // }
        // user's device info
        // const user = await userModel.findOne({ _id: userId, "devices.deviceId": deviceId });
        // if (!user) return res.status(404).json({ status: false, message: "User or device not found" });
    
        // const device = user.devices.find(d => d.deviceId === deviceId);
        // // const lastSync = clientLastSync || device?.lastSync || new Date(0); // fallback to epoch if first sync
        //  await userModel.updateOne(
        //   { _id: userId, "devices.deviceId": deviceId },
        //   { $set: { "devices.$.lastSync": new Date(), "devices.$.lastActive": new Date() } }
        // );
        const user = await userModel.findOne({ _id: userId, "devices.deviceId": deviceId });
            if (!user) return res.status(404).json({ status: false, message: "User or device not found" });
        let docList=[]
        if(!lastSync){
           docList = await Document.find({ uploadedBy: req.user._id.toString(),isDeleted:false});
        }else{
           docList = await Document.find({ uploadedBy: req.user._id.toString(),updatedAt: { $gt: lastSync },isDeleted:false});
            await userModel.updateOne(
                { _id: userId, "devices.deviceId": deviceId },
                { $set: { "devices.$.lastSync": new Date(), "devices.$.lastActive": new Date() } }
            );
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
    

    const uploadDir = path.join(__dirname, "../uploads");
    const filePath = path.join(uploadDir, "sample3.pdf");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, "FAKE PDF CONTENT");

    const doc = await Document.findOne({_id:req.query.id.toString(),isDeleted:false});
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
     if(req.query.download==true){
    return res.download(path.resolve(doc.filePath));
     }else{
          return res.status(200).json({ status: true,message: 'Report details are here', data: doc });
     }
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

    return res.status(200).json({ status: true,message: 'Document deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
};

module.exports.editDocument = async function (req, res) {
    try {
        // let data = req.body;
        // data.uploadedBy = req.user._id.toString();
        let reportId = req.body.reportId.trim();
    //     const doc = await Document.findOne({_id:reportId,isDeleted:false});
    //     if (!doc) return res.status(404).json({ message: 'Not found' });
    //      let reportNameExist= await Document.findOne({name:req.body.name,isDeleted:false})
    // if(reportNameExist!=null){
    //     return res.status(400).send({ status: false, message: "Entered Report Name is already exist" });
    // }

    const doc = await Document.findOne({ _id: reportId, isDeleted: false });
    if (!doc) {
      console.log("doc not found",reportId);
      return res.status(404).json({ status: false, message: 'Document not found' });
    }

    if (req.body.name && req.body.name.trim() !== doc.name) {
      const duplicate = await Document.exists({
        name: req.body.name.trim(),
        _id: { $ne: reportId },
        isDeleted: false
      });
      if (duplicate) {
        console.log(duplicate,"dup--->>>")
        return res.status(400).json({
          status: false,
          message: 'A document with this name already exists.'
        });
      }
    }

   
        if(req.body.version != doc.version) {
          console.log(req.body.version,doc.version,"doc version--->>>")
        return res.status(409).json({
           message: 'Conflict detected',
           serverVersion: doc.version,
           currentData: doc
        });
        }
        // data.version=doc.version+1;
        let data = {
            name: req?.body?.name,
            fileName: req?.file?.originalname,
            filePath: req?.file?.path,
            fileType: req?.file?.mimetype,
            size: req?.file?.size,
            uploadedBy: req.user._id.toString(), 
            relatedTo: req?.body?.relatedTo || 'general',
            deviceId: req?.body?.deviceId || null,
            version: doc.version + 1
        }
         // Apply updates
    Object.assign(doc, data);
    // if (req.body.name) doc.name = req.body.name.trim();
    // doc.version += 1;
    await doc.save();
        // let updated = await Document.findOneAndUpdate({ _id: reportId,isDeleted:false }, { $set: data }, { new: true })
        return res.status(200).send({ status: true, message: "Data updated succefully", data: doc })
       } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
       }
}

module.exports.getDocumentById = async(req,res)=>{
  try{
    const doc = await Document.findOne({_id:req.query.id.toString(),isDeleted:false});
    return res.status(200).json({ status: true,message: 'Report details are here', data: doc });
  }catch(error){
    res.status(500).json({ message: 'Error deleting alert', error });
  }
}
