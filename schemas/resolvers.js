const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');
const UserProgress = require('../models/UserProgress');

module.exports = {
  users: async () => {
    try {
      const users = await User.find();
      return users;
    } catch (err) {
      throw err;
    }
  },
  games: async () => {
    try {
      const games = await Game.find();
      return games;
    } catch (err) {
      throw err;
    }
  },
  game: async ({ id }) => {
    try {
      const game = await Game.findById(id);
      return game;
    } catch (err) {
      throw err;
    }
  },
  userProgress: async ({ userId, gameId }) => {
    try {
      const progress = await UserProgress.findOne({ userId, gameId });
      return progress;
    } catch (err) {
      throw err;
    }
  },
  createUser: async ({ username, email, password }) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        username,
        email,
        password: hashedPassword
      });
      const result = await user.save();
      return { ...result._doc, password: null };
    } catch (err) {
      throw err;
    }
  },
  createGame: async ({ title, description, scenes }) => {
    try {
      const game = new Game({
        title,
        description,
        scenes
      });
      const result = await game.save();
      return result;
    } catch (err) {
      throw err;
    }
  },
  updateUserProgress: async ({ userId, gameId, currentSceneId }) => {
    try {
      let progress = await UserProgress.findOne({ userId, gameId });
      if (!progress) {
        progress = new UserProgress({
          userId,
          gameId,
          currentSceneId
        });
      } else {
        progress.currentSceneId = currentSceneId;
      }
      const result = await progress.save();
      return result;
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    return { userId: user.id, token: token, tokenExpiration: 1 };
  },
  signup: async ({ username, email, password }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User exists already.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    const result = await user.save();
    const token = jwt.sign({ userId: result.id, email: result.email }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    return { userId: result.id, token: token, tokenExpiration: 1 };
  }
};
