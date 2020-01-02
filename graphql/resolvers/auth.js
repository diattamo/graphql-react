const bcrypt = require('bcryptjs');
const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const user = await User.findOne({ email: args.userInput.email });
      if (user) {
        throw new Error('User exists already');
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
  }
};
