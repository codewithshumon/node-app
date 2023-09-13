const express = require('express');
const mongoose = require('mongoose');
const testHandler = require('./routeHandler/testHandler');

const app = express();
app.use(express.json());

mongoose
    .connect('mongodb://localhost/test')
    .then(() => {
        console.log('connection successful');
    })
    .catch((err) => console.log(err));
app.use('/test', testHandler);

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    } else {
        res.status(500).json({ error: err });
    }
}

app.listen(5000, () => {
    console.log('server started at port 5000');
});
