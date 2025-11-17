const reminderAlertsModel = require("../Models/reminderAlertModel");
const reminderQueue = require('../Jobs/queues/reminderQueues');
const userModel = require("../Models/userModel");
const moment = require("moment-timezone");

// module.exports.addReminderAlert = async function (req, res) {
//     try {
//         let data = req.body;
//         data.createdBy = req.user._id.toString();
//         // const [day, month, year] = req.body.date.split("-");
//         // data.date = new Date(year,month-1,day);
//          // Combine date and time to one proper Date
//     const [day, month, year] = req.body.date.split("-");
//     const fullDateTimeStr = `${year}-${month}-${day} ${req.body.time}`; // e.g., "2025-11-06 10:57 am"

//     const alertDate = new Date(fullDateTimeStr);
//     if (isNaN(alertDate)) {
//       return res.status(400).send({ status: false, message: "Invalid date or time format" });
//     }

//     data.date = alertDate; // store full timestamp

//     // Save reminder in DB
//     const createAlert = await reminderAlertsModel.create(data);

//     // Calculate reminder 10 mins before
//     const reminderTime = new Date(alertDate.getTime() - 10 * 60 * 1000);
//     const delay = Math.max(reminderTime - Date.now(), 0);

//     console.log(`⏰ Reminder scheduled in ${delay / 1000 / 60} minutes`);

//     // Add BullMQ job
//     await reminderQueue.add(
//       "sendReminder",
//       { alertId: createAlert._id, userId: req.user._id },
//       {
//         delay, // execute later
//         attempts: 3,
//         backoff: { type: "exponential", delay: 2000 },
//         removeOnComplete: true,
//         removeOnFail: false,
//       }
//     );
//         // const createAlert = await reminderAlertsModel.create(data)
//         // const delay = new Date(time).getTime() - Date.now() - (15 * 60 * 1000); // 15 mins before
//         // await notificationQueue.add("sendNotification",
//         //     { token, title, body: "Your meeting starts in 15 minutes" },
//         //     { delay, attempts: 3, backoff: { type: "exponential", delay: 2000 } }
//         // );

//         // Schedule a reminder job 10 min before the alert time
//         // const reminderTime = new Date(data.date.getTime() - 10 * 60 * 1000);
//         // await reminderQueue.add(
//         //     'sendReminder',
//         //     { alertId: createAlert._id, userId: req.user._id },
//         //     { delay: reminderTime - Date.now() } // auto runs later
//         // );
//         return res.status(201).send({ status: true, message: "Alert created successfully", data: createAlert })
//     } catch (error) {
//         return res.status(500).send({ status: false, message: error.message })
//     }
// }

module.exports.addReminderAlert = async function (req, res) {
  try {
    let data = req.body;
    data.createdBy = req.user._id.toString();

    // Parse date & time correctly with timezone (Asia/Kolkata)
    const [day, month, year] = req.body.date.split("-");
    const fullDateTimeStr = `${year}-${month}-${day} ${req.body.time}`; // e.g. "2025-11-07 05:14 pm"

    // Convert to JS Date object based on Asia/Kolkata timezone
    const alertMoment = moment.tz(fullDateTimeStr, "YYYY-MM-DD hh:mm a", "Asia/Kolkata");
    if (!alertMoment.isValid()) {
      return res.status(400).send({ status: false, message: "Invalid date or time format" });
    }

    // Store in UTC to keep DB consistent
    const alertDate = alertMoment.toDate();
    data.date = alertDate;

    //  Save reminder
    const createAlert = await reminderAlertsModel.create(data);

    // Schedule reminder 10 minutes before
    const reminderTime = new Date(alertDate.getTime() - 10 * 60 * 1000);
    const delay = Math.max(reminderTime - Date.now(), 0);

    console.log(`⏰ Reminder scheduled in ${(delay / 1000 / 60).toFixed(2)} minutes`);

    // Add job to BullMQ
    await reminderQueue.add(
      "sendReminder",
      { alertId: createAlert._id, userId: req.user._id },
      {
        delay,
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    return res.status(201).send({
      status: true,
      message: "Alert created successfully",
      data: createAlert,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ status: false, message: error.message });
  }
};

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
        let deviceId = req.query.deviceId;
        let userId = req.user._id.toString();
        if (req.user.role !== 'primary') {
            return res.status(403).json({ message: 'Access denied' });
        }
        let alertList=[]
        
    // Get user's device info
    const user = await userModel.findOne({ _id: userId, "devices.deviceId": deviceId });
    if (!user) return res.status(404).json({ status: false, message: "User or device not found" });
   
    // const device = user.devices.find(d => d.deviceId == deviceId);
    // const lastSync = clientLastSync || device?.lastSync || new Date(0); // fallback to epoch if first sync

        if(!lastSync){
           alertList = await reminderAlertsModel.find({ createdBy: req.user._id.toString(),isDeleted:false});
        }else{
           alertList = await reminderAlertsModel.find({ createdBy: req.user._id.toString(),updatedAt: { $gt: lastSync },isDeleted:false});
            await userModel.updateOne(
                { _id: userId, "devices.deviceId": deviceId },
                { $set: { "devices.$.lastSync": new Date(), "devices.$.lastActive": new Date() } }
            );
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

module.exports.getAlertDetails = async(req,res)=>{
  try{
    const doc = await reminderAlertsModel.findOne({_id:req.query.id.toString(),isDeleted:false});
    return res.status(200).json({ status: true,message: 'Alert details are here', data: doc });
  }catch(error){
    res.status(500).json({ message: 'Error deleting alert', error });
  }
}
