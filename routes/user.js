const express = require("express");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const User = require("../models/user");

const authorization = require("../middlewares/authorization");

router.post("/signup", async (req, res) => {
  try {
    const { username, password, email } = req.fields;

    const emailExist = await User.find({ email: email });
    const usernameExist = await User.find({ "account.username": username });

    if (!emailExist[0] && !usernameExist[0]) {
      const token = uid2(64);
      const salt = uid2(16);
      const hash = SHA256(salt + password).toString(encBase64);

      const newUser = new User({
        email: email,
        account: {
          username: username,
          avatar: null,
        },
        favorites: [],
        token: token,
        salt: salt,
        hash: hash,
      });

      if (req.files.picture) {
        newUser.account.avatar = await cloudinary.uploader.upload(
          req.files.picture.path,
          {
            folder: `Marvel/userAvatar/${newUser._id}`,
          }
        );
      }
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        account: newUser.account,
        token: newUser.token,
      });
    } else {
      res.status(400).json({ message: "User name or email already exist" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.fields;

    const user = await User.find({ email: email });
    if (user[0]) {
      const newHash = SHA256(user[0].salt + password).toString(encBase64);
      if (newHash === user[0].hash) {
        res.status(200).json({
          _id: user[0]._id,
          account: user[0].account,
          token: user[0].token,
          favorites: user[0].favorites,
        });
      } else {
        res.status(400).json({ message: "incorrect email or password" });
      }
    } else {
      res.status(400).json({ message: "incorrect email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/user/update/:id", authorization, async (req, res) => {
  try {
    const { username, email, comics, characters } = req.fields;
    const { avatar } = req.files;
    const userUpdated = await User.findById({ _id: req.params.id });

    if (username) {
      const usernameTest = await User.findOne({ "account.username": username });
      if (!usernameTest) {
        userUpdated.account.username = username;
      } else {
        res.status(400).json({ message: "Name already exist" });
      }
    }

    if (email) {
      const emailTest = await User.findOne({ email: email });
      if (!emailTest) {
        userUpdated.email = email;
      } else {
        res.status(400).json({ message: "Email already exist" });
      }
    }
    if (characters) {
      const arrCharacters = userUpdated.favorites.characters;
      let charactersTest = false;
      let indexChar;
      arrCharacters.forEach((elem, index) => {
        if (characters._id === elem._id) {
          charactersTest = true;
          indexChar = index;
        }
      });
      if (!charactersTest) {
        arrCharacters.push(characters);
      } else {
        arrCharacters.splice(indexChar, 1);
      }
    }

    if (comics) {
      const arrComics = userUpdated.favorites.comics;
      let comicsTest = false;
      let indexComic;
      arrComics.forEach((elem, index) => {
        if (comics._id === elem._id) {
          comicsTest = true;
          indexComic = index;
        }
      });
      if (!comicsTest) {
        arrComics.push(comics);
      } else {
        arrComics.splice(indexComic, 1);
      }
    }

    await userUpdated.save();
    res.status(200).json(userUpdated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
