const Redis = require("ioredis");
const { redisUrl } = require("./env");

const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 1000, 3000);
  },
});

let errorLogged = false;
let connected = false;

redis.on("error", (err) => {
  if (!errorLogged) {
    console.warn(`[Redis] Not available (${err.message}). Auto-save features will be disabled.`);
    errorLogged = true;
  }
});

redis.on("connect", () => {
  connected = true;
  errorLogged = false;
  console.log("[Redis] Connected");
});

redis.on("end", () => {
  connected = false;
});

redis.connect().catch(() => {});

const safeRedis = {
  isAvailable: () => connected,
  async get(key) {
    if (!connected) return null;
    try { return await redis.get(key); } catch { return null; }
  },
  async setex(key, ttl, value) {
    if (!connected) return false;
    try { await redis.setex(key, ttl, value); return true; } catch { return false; }
  },
  async del(key) {
    if (!connected) return false;
    try { await redis.del(key); return true; } catch { return false; }
  },
};

module.exports = safeRedis;
