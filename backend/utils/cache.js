const NodeCache = require('node-cache');

// Initialize cache with default TTL of 5 minutes (300 seconds) and check period of 1 minute
const appCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Store an OTP in the cache.
 * @param {string} email
 * @param {string} otpCode
 * @param {string} purpose - e.g., 'verification' or 'reset'
 * @param {number} ttlSeconds - Time to live in seconds (default 10 minutes)
 */
const setOtp = (email, otpCode, purpose, ttlSeconds = 600) => {
  const key = `otp:${email.toLowerCase()}:${purpose}`;
  appCache.set(key, otpCode, ttlSeconds);
};

/**
 * Retrieve an OTP from the cache.
 * @param {string} email
 * @param {string} purpose
 * @returns {string|undefined} The cached OTP or undefined if expired/not found
 */
const getOtp = (email, purpose) => {
  const key = `otp:${email.toLowerCase()}:${purpose}`;
  return appCache.get(key);
};

/**
 * Delete an OTP from the cache.
 * @param {string} email
 * @param {string} purpose
 */
const deleteOtp = (email, purpose) => {
  const key = `otp:${email.toLowerCase()}:${purpose}`;
  appCache.del(key);
};

/**
 * Cache user data.
 * @param {string} userId
 * @param {object} userData
 * @param {number} ttlSeconds - Default 5 minutes (300 seconds)
 */
const cacheUser = (userId, userData, ttlSeconds = 300) => {
  const key = `user:${userId}`;
  // We clone the object to prevent mutation reference issues
  appCache.set(key, JSON.parse(JSON.stringify(userData)), ttlSeconds);
};

/**
 * Retrieve cached user data.
 * @param {string} userId
 * @returns {object|undefined}
 */
const getCachedUser = (userId) => {
  const key = `user:${userId}`;
  return appCache.get(key);
};

/**
 * Invalidate cached user data.
 * @param {string} userId
 */
const invalidateUserCache = (userId) => {
  const key = `user:${userId}`;
  appCache.del(key);
};

/**
 * Store a CAPTCHA answer in the cache, keyed by a one-time captchaId.
 * @param {string} captchaId
 * @param {string|number} answer
 * @param {number} ttlSeconds - Default 5 minutes (300 seconds)
 */
const setCaptcha = (captchaId, answer, ttlSeconds = 300) => {
  const key = `captcha:${captchaId}`;
  appCache.set(key, answer.toString(), ttlSeconds);
};

/**
 * Retrieve a CAPTCHA answer from the cache.
 * @param {string} captchaId
 * @returns {string|undefined}
 */
const getCaptcha = (captchaId) => {
  const key = `captcha:${captchaId}`;
  return appCache.get(key);
};

/**
 * Delete a CAPTCHA from the cache. Always call this after verification
 * (success or failure) so a captcha answer can never be reused/replayed.
 * @param {string} captchaId
 */
const deleteCaptcha = (captchaId) => {
  const key = `captcha:${captchaId}`;
  appCache.del(key);
};

module.exports = {
  setOtp,
  getOtp,
  deleteOtp,
  cacheUser,
  getCachedUser,
  invalidateUserCache,
  setCaptcha,
  getCaptcha,
  deleteCaptcha,
  cacheInstance: appCache // exported in case raw access is needed
};
