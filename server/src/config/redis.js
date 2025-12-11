const redis = require('redis');

const { createClient } = redis;

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 12457
    }
});

// redisClient.on('error', err => console.log('Redis Client Error', err));

// await redisClient.connect();

// await redisClient.set('foo', 'bar');
// const result = await redisClient.get('foo');
// console.log(result)  // >>> bar

module.exports = redisClient;