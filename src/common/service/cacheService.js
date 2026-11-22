import { client } from "../../db/redisConnection.js";

export const setCache = async ({ key, value, ttl }) => {
  if (typeof value !== "string") {
    value = JSON.stringify(value);
  }
  return await client.set(key, value, { EX: ttl });
};

export const getCache = async ({ key }) => {
  let result = await client.get(key);
  try {
    return JSON.parse(result);
  } catch {
    return result;
  }
};

export const ttlCache = async ({ key }) => {
  return await client.ttl(key);
};
export const incrementCache = async ({ key, incr = 1 }) => {
  return await client.incrBy(key, incr);
};
export const expireCache = async ({ key, ttl }) => {
  return await client.expire(key, ttl);
};

export const existsCache = async ({ key }) => {
  return await client.exists(key);
};

export const keysCache = async ({ prefix }) => {
  return await client.keys(`${prefix}*`);
};
export const deleteCache = async ({ keys }) => {
  return await client.del(keys);
};
export const deleteCacheByPrefix = async ({ prefix }) => {
  return await client.del(await keysCache({ prefix }));
};
