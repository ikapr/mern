const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const resolvers = {
  Mutation: {
    signIn: async (_, { email, password }) => {
      try {
        let userToSignIn = await User.findOne({ email });

        // If User is not Found or Wrong Password from Bcrypt
        if (!userToSignIn || !bcrypt.compareSync(password, userToSignIn.password)) {
          throw new Error (`Invalid Credentials`);
        }

        let token = jwt.sign({ userId: userToSignIn._id }, process.env.SECRET, { expiresIn: `2h` });

        return {
          token,
          user: userToSignIn
        };
      } catch {
        throw new Error(`Error Signing In: ${error.message}`);
      }
    },
    addUser: async (_, { newUser }) => {
      try {
        const userToSave = new User(newUser);
        await userToSave.validate();
        const savedUser = await userToSave.save();
        let token = jwt.sign({ userId: savedUser._id }, process.env.SECRET, { expiresIn: `2h` });
        return {
          token,
          user: savedUser
        };
      } catch (error) {
        throw new Error(`Error Adding User: ${error.message}`);
      }
    },
    addBookToSavedBooks: async (_, { userId, book }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { savedBooks: book } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        throw new Error(err);
      }
    },
    removeBookFromSavedBooks: async (_, { userId, bookId }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return updatedUser;
      } catch (err) {
        throw new Error(err);
      }
    }
    
  },
  Query: {
    users: async () => {
      let users = await User.find();
      return users;
    },
  }
}

module.exports = resolvers;