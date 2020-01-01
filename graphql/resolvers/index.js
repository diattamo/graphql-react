const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/bookings");

const user = async userId => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  } catch (err) {
    throw err;
  }
};

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event.creator)
        };
      });
    } catch (err) {
      throw err;
    }
  },

  booking: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return {
          ...booking._doc,
          _id: booking.id,
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      });
    } catch (error) {
      throw error;
    }
  },

  createEvent: async args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5e0c7392c7fa97f976a9dd11"
    });
    let createdEvent;
    try {
      const savedEvent = event.save();
      createdEvent = {
        ...savedEvent._doc,
        date: new Date(savedEvent._doc.date).toISOString(),
        creator: user.bind(this, savedEvent.creator),
        _id: savedEvent.id
      };
      const user = await User.findById("5e0c7392c7fa97f976a9dd11");
      if (!user) {
        throw new Error("user not found");
      }
      user.createdEvents.push(event);
      await user.save();
    } catch (err) {
      console.log(err);
    }
  },
  createUser: async args => {
    try {
      const user = await User.findOne({ email: args.userInput.email });
      if (user) {
        throw new Error("User exists already");
      }
      const hashedPwd = await bcrypt.hash(args.userInput.password, 12);
      const userWithHashedpwd = new User({
        email: args.userInput.email,
        password: hashedPwd
      });
      const savedUserWithHashedpwd = await userWithHashedpwd.save();
      return {
        ...savedUserWithHashedpwd._doc,
        password: null,
        _id: savedUserWithHashedpwd.id
      };
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async args => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "5e0c7392c7fa97f976a9dd11",
      event: fetchedEvent
    });
    const result = await booking.save();
    return {
      ...result,
      _id: result.id,
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString()
    };
  }
};
