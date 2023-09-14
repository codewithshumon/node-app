const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const userSchema = require('../schemas/userSchema');
const User = new mongoose.model('User', userSchema);
const checkLogin = require('../middlewares/checkLogin');

// User signup route
router.post('/signup', async (req, res) => {
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashPassword,
        status: req.body.status,
    });
    try {
        await newUser.save();
        res.status(200).json({
            message: 'User was created successfully',
        });
        console.log(newUser);
    } catch (err) {
        res.status(500).json({
            error: 'Signup failed',
        });
        console.log(err);
    }
});

// User loging route
router.post('/login', async (req, res) => {
    try {
        const user = await User.find({ username: req.body.username });
        if (user && user.length > 0) {
            const isValidPassword = await bcrypt.compare(req.body.password, user[0].password);
            if (isValidPassword) {
                const token = jwt.sign(
                    {
                        username: user[0].username,
                        userId: user[0]._id,
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: '1h',
                    },
                );
                res.status(200).json({
                    token: token,
                    message: 'Login Success',
                });
            } else {
                res.status(401).json({
                    error: 'Invalid loging activity',
                });
            }
        } else {
            res.status(401).json({
                error: 'Invalid loging activity',
            });
        }
    } catch (err) {
        res.status(500).json({
            error: `Login failed! ${err}`,
        });
        console.log(err);
    }
});

//getting tests data from user data
router.get('/auth', checkLogin, async (req, res) => {
    console.log([req.username, req.userid]);
    try {
        const result = await User.find({ status: 'active' }).populate('tests');
        console.log(result);
        res.status(200).json({
            result: result,
            message: 'The test was found successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});
module.exports = router;
