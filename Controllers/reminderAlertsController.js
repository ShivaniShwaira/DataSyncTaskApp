const reminderAlertsModel = require("../Models/reminderAlertModel");

module.exports.addReminderAlert = async function (req, res) {
    try {
        let data = req.body;
        data.createdBy = req.user._id.toString();
        const [day, month, year] = req.body.date.split("-");
        data.date = new Date(year,month-1,day);
        const createAlert = await reminderAlertsModel.create(data)
        return res.status(201).send({ status: true, message: "Alert created successfully", data: createAlert })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

module.exports.editAlert = async function (req, res) {
    try {
        let data = req.body;
        data.createdBy = req.user._id.toString();
        const [day, month, year] = data.date.split("-");
        data.date = new Date(year,month-1,day);
        let alertId = req.body.alertid.trim();
        const reminder = await reminderAlertsModel.findOne({_id:alertId,isDeleted:false});
        if (!reminder) return res.status(404).json({ message: 'Not found' });

        if(req.body.version != reminder.version) {
        return res.status(409).json({
           message: 'Conflict detected',
           serverVersion: reminder.version,
           currentData: reminder
        });
        }
        data.version=reminder.version+1;
        let updated = await reminderAlertsModel.findOneAndUpdate({ _id: alertId,isDeleted:false }, { $set: data }, { new: true })
        return res.status(200).send({ status: true, message: "Data updated succefully", data: updated })
       } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
       }
}

module.exports.getAlertList = async function (req, res) {
    try {
        let lastSync = req.query.lastSync;
        if (req.user.role !== 'primary') {
            return res.status(403).json({ message: 'Access denied' });
        }
        let alertList=[]
        if(!lastSync){
           alertList = await reminderAlertsModel.find({ createdBy: req.user._id.toString(),isDeleted:false});
        }else{
           alertList = await reminderAlertsModel.find({ createdBy: req.user._id.toString(),updatedAt: { $gt: lastSync },isDeleted:false});

        }
        return res.status(200).send({ status: true, message: "Alert List is here", data: alertList })
       } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
       }
}

module.exports.deleteAlert = async (req, res) => {
  try {
    const doc = await reminderAlertsModel.findOne({_id:req.body.id.toString(),isDeleted:false});
    if (!doc) return res.status(404).json({ message: 'Alert not found' });

    doc.isDeleted = true;
    doc.version += 1;
    await doc.save();

    return res.status(200).json({ status: true,message: 'Alert deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting alert', error });
  }
};
