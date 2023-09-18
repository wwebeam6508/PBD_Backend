import NodeCache from "node-cache";
const cache = new NodeCache({
  stdTTL: 60 * 60 * 24, // 1 day
  checkperiod: 60 * 5,
  forceString: true,
});

export default {
  getFromCache: (key) => cache.get(key),
  setCache: (key, data, ttl) => cache.set(key, data, ttl),
  resetCache: (key) => cache.del(key),
};
