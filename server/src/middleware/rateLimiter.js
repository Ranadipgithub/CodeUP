const radisClient = require('../config/redis');

const submitCodeRateLimiter = async (req, res, next) => {
    const userId = req.user._id;
    const radisKey = `submit_cooldown:${userId}`;

    try{
        const exists = await radisClient.exists(radisKey);
        if(exists){
            return res.status(429).json({ error: "Too many requests. Please wait before submitting again." });
        }
        await radisClient.set(radisKey, 'cooldown-active', { EX: 10, NX: true }); // 10 seconds cooldown
        next();
    } catch(err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { submitCodeRateLimiter };