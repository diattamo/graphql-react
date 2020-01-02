const Event = require('../../models/event');
const User = require('../../models/user');


const authResolver = require('./auth');
const bookingResolver = require('./booking');
const eventsResolver = require('./events');

const rootResolver = {
    ...authResolver,
    ...bookingResolver,
    ...eventsResolver
};

module.exports = rootResolver;