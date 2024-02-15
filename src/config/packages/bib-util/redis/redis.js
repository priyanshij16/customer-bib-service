const Promise = require("bluebird");
const config = require("../../config");
const redis = require("redis");
import { logger } from '../../../../utils/logger'

   //Start Up redis 
   const client = redis.createClient(config.redisDb.port, config.redisDb.host);

   client.on('connect', function() {
      logger.info('Redis client connected');
   });

   client.on('error', function (err) {
      logger.error('Something went wrong ' + err);
   });

const setValue = async function (key, value) {
  try {
    return await client.setAsync(key, value);
  } catch (e) {
    throw e;
  }
};

const getValue = async function (key) {
  try {
    return await client.getAsync(key);
  } catch (e) {
    throw e;
  }
};

const deleteKey = async function (key) {
  try {
    return await client.delAsync(key);
  } catch (e) {
    throw e;
  }
};
const setJWTToken = function (user) {
  const key = user.id;
  const value = user.token;

  const saveUsrData = setValue(key, value);
  return saveUsrData;

};


module.exports = {
  setValue,
  getValue,
  deleteKey,
  setJWTToken
};

