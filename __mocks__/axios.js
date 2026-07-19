const { fn } = require("jest-mock");
const axios = {
  create: fn(() => axios),
  get: fn(() => Promise.resolve({ data: {} })),
  post: fn(() => Promise.resolve({ data: {} })),
  put: fn(() => Promise.resolve({ data: {} })),
  patch: fn(() => Promise.resolve({ data: {} })),
  delete: fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { use: fn(), eject: fn() },
    response: { use: fn(), eject: fn() },
  },
  defaults: { adapter: "http", headers: { common: {} } },
};

module.exports = axios;
module.exports.default = axios;
