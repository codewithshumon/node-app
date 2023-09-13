const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const testSchema = require('../schemas/testSchemas');
const Test = new mongoose.model('Test', testSchema);

router.get('/', async (req, res) => {
    try {
        const result = await Test.find({ status: 'active' }).select({
            _id: 0, // 0 means hide the field
            __v: 0,
            date: 0,
        });
        console.log(result);

        res.status(200).json({
            result: result,
            message: 'The test was found successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await Test.find({ _id: req.params.id });
        console.log(result);
        res.status(200).json({
            result: result,
            message: 'The test is found successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});
router.post('/', async (req, res) => {
    const newTest = new Test(req.body);
    try {
        await newTest.save();
        res.status(200).json({
            message: 'Test was inserted successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.post('/all', async (req, res) => {
    try {
        await Test.insertMany(req.body);
        res.status(200).json({
            message: 'All tests were inserted successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const result = await Test.findByIdAndUpdate(
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
            message: 'All tests were updated successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.put('/find/:id', async (req, res) => {
    const idToUpdate = req.params.id;
    const updateData = {
        $unset: {
            date: 1, // 1 means remove the field
            status: 1,
        },
    };

    try {
        const updatedDocument = await Test.findByIdAndUpdate(idToUpdate, updateData, { new: true });

        if (!updatedDocument) {
            // If the document was not found, return a 404 status
            return res.status(404).json({
                error: 'Document not found',
            });
        }

        res.status(200).json({
            message: 'Fields "date" and "status" removed successfully',
            updatedDocument: updatedDocument,
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await Test.deleteOne({ _id: req.params.id });
        console.log(result);
        res.status(200).json({
            result: result,
            message: 'The test is deleted successfully',
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

router.delete('/find/:id', async (req, res) => {
    const idToDelete = req.params.id;

    try {
        const deletedDocument = await Test.findByIdAndDelete(idToDelete);

        if (!deletedDocument) {
            return res.status(404).json({
                error: 'Document not found',
            });
        }
        console.log(deletedDocument);
        res.status(200).json({
            message: 'Document deleted successfully',
            deletedDocument: deletedDocument,
        });
    } catch (err) {
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

// use of instance methos
// get active test
router.get('/active', async (req, res) => {
    const test = new Test();
    try {
        const data = await test.findActive();
        console.log(data);
        res.status(200).json({
            result: data,
            message: 'The test is found successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

// use of static methos
// get active test
router.get('/find/js', async (req, res) => {
    try {
        const test = await Test.findByJs();
        console.log(test);
        res.status(200).json({
            result: test,
            message: 'The test is found successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});
// get active test
router.get('/find/language', async (req, res) => {
    try {
        const test = await Test.find().byLanguage('JS');
        console.log(test);
        res.status(200).json({
            result: test,
            message: 'The test is found successfully',
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: 'There was a server error',
        });
    }
});

module.exports = router;
