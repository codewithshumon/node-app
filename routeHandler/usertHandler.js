const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const usertSchema = require('../schemas/userSchema');
const User = new mongoose.model('User', usertSchema);

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

router.get('/signup', async (req, res) => {
    try {
        const result = await User.find({ status: 'active' }).select({
            _id: 0, // 0 means hide the field
            __v: 0,
            date: 0,
        });
        console.log(result);

        res.status(200).json({
            result: result,
            message: 'The User was found successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const result = await User.findByIdAndUpdate(
            { _id: req.params.id },
            {
                $set: {
                    status: 'inactive',
                    title: 'learn with Shumon khan saam',
                },
            },
            { new: true },
        );
        console.log(result);
        res.status(200).json({
            message: 'All Users were updated successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await User.deleteOne({ _id: req.params.id });
        console.log(result);
        res.status(200).json({
            result: result,
            message: 'The User is deleted successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

module.exports = router;
