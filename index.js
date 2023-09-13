const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const testHandler = require('./routeHandler/testHandler');
const usertHandler = require('./routeHandler/usertHandler');

const app = express();
dotenv.config();
app.use(express.json());

mongoose
    .connect('mongodb://localhost/test')
    .then(() => {
        console.log('connection successful');
    })
    .catch((err) => console.log(err));
app.use('/test', testHandler);
app.use('/user', usertHandler);

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    } else {
        console.log(err);
        res.status(500).json({ error: err });
    }
};

app.use(errorHandler);

app.listen(5000, () => {
    console.log('server started at port 5000');
});
