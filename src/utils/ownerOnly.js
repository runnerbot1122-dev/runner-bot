const { requireOwner } = require('./checkPermission');
module.exports = function ownerOnly(ctx) { requireOwner(ctx); };
