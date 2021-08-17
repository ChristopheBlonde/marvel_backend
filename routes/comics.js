const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/user");
const authorization = require("../middlewares/authorization");

router.get("/comics", async (req, res) => {
  try {
    const { limit, skip, title, page } = req.query;
    let numLimit;
    let numSkip;
    let search = "";

    if (limit) {
      numLimit = Number(limit);
    } else {
      numLimit = 100;
    }

    if (skip) {
      numSkip = Number(skip);
    } else {
      numSkip = 0;
    }
    if (title) {
      search = title;
    }
    if (page || page >= 1) {
      numSkip = numLimit * Number(page) - numLimit;
    }

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics?apiKey=${process.env.MARVEL_API_KEY}&limit=${numLimit}&skip=${numSkip}&title=${search}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/characters", async (req, res) => {
  try {
    const { skip, limit, name, page } = req.query;

    let numSkip;
    let numLimit;
    let search = "";

    if (limit) {
      numLimit = Number(limit);
    } else {
      numLimit = 100;
    }

    if (skip) {
      numSkip = Number(skip);
    } else {
      numSkip = 0;
    }
    if (name) {
      search = name;
    }
    if (page || page >= 1) {
      numSkip = numLimit * Number(page) - numLimit;
    }

    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/characters?apiKey=${process.env.MARVEL_API_KEY}&limit=${numLimit}&skip=${numSkip}&name=${search}`
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/comics/:characterid", async (req, res) => {
  try {
    const response = await axios.get(
      `https://lereacteur-marvel-api.herokuapp.com/comics/${req.params.characterid}?apiKey=${process.env.MARVEL_API_KEY}`
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/favorites/:id", authorization, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
