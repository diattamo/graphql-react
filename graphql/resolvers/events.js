const Event = require('../../models/event');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5e0c7392c7fa97f976a9dd11'
    });
    let createdEvent;
    try {
      const savedEvent = await event.save();
      createdEvent = transformEvent(savedEvent);
      const user = await User.findById('5e0c7392c7fa97f976a9dd11');
      if (!user) {
        throw new Error('user not found');
      }
      user.createdEvents.push(event);
      await user.save();
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
};
