// src/jobs/queues/reminderQueue.js
const { Queue } = require('bullmq');
const connection = require('../../Config/redis');

// Create the queue (Redis key: bull:reminderQueue)
const reminderQueue = new Queue('reminderQueue', { connection });

module.exports = reminderQueue;
