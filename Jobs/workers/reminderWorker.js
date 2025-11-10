// src/jobs/workers/reminderWorker.js
const { Worker } = require('bullmq');
const connection = require('../../Config/redis');
const reminderAlertsModel = require('../../Models/reminderAlertModel');
const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo-db:27017/dataSyncTask', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Worker connected to MongoDB'))
.catch(err => console.error('MongoDB connection error in worker:', err));

// Background worker that runs separately or within app
const reminderWorker = new Worker(
  'reminderQueue',
  async job => {
    const { alertId, userId } = job.data;
    console.log(`Processing reminder job for alert: ${alertId}`);

    const alert = await reminderAlertsModel.findById(alertId);
    if (!alert) throw new Error('Alert not found');

    // actual logic: send notification / email / push
    console.log(`Reminder for user ${userId}: ${alert.name}`);

    return { status: 'success', processedAt: new Date() };
  },
  { connection }
);

reminderWorker.on('completed', job => {
  console.log(`✅ Reminder job ${job.id} completed`);
});
reminderWorker.on('failed', (job, err) => {
  console.error(`❌ Reminder job ${job.id} failed:`, err.message);
});

module.exports = reminderWorker;
