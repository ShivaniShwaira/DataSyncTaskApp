// src/config/redis.js
const { Redis } = require('ioredis');

const connection = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,   // ✅ REQUIRED for Redis Cloud
  // tls: {},  // required for Redis Cloud
  maxRetriesPerRequest: null,   // ✅ REQUIRED by BullMQ
  enableReadyCheck: false,      // ✅ helps avoid startup delays
});

module.exports = connection;
