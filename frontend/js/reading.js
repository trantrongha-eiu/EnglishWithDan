/**
 * API Routes for IELTS Reading Tests
 * File: routes/reading.js
 */

const express = require('express');
const router = express.Router();
const ReadingTest = require('../models/ReadingTest');

// GET /api/reading/tests - Lấy tất cả bài test
router.get('/tests', async (req, res) => {
    try {
        const tests = await ReadingTest.find()
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json(tests);
    } catch (error) {
        console.error('Error fetching reading tests:', error);
        res.status(500).json({ 
            error: 'Failed to fetch reading tests',
            message: error.message 
        });
    }
});

// GET /api/reading/tests/:id - Lấy một bài test cụ thể
router.get('/tests/:id', async (req, res) => {
    try {
        const test = await ReadingTest.findById(req.params.id);
        
        if (!test) {
            return res.status(404).json({ error: 'Test not found' });
        }
        
        res.json(test);
    } catch (error) {
        console.error('Error fetching reading test:', error);
        res.status(500).json({ 
            error: 'Failed to fetch reading test',
            message: error.message 
        });
    }
});

// POST /api/reading/tests - Thêm bài test mới (Admin only)
router.post('/tests', async (req, res) => {
    try {
        const testData = req.body;
        
        // Validate required fields
        if (!testData.title || !testData.passages) {
            return res.status(400).json({ 
                error: 'Missing required fields: title and passages are required' 
            });
        }
        
        const newTest = new ReadingTest(testData);
        await newTest.save();
        
        res.status(201).json({
            message: 'Test created successfully',
            test: newTest
        });
    } catch (error) {
        console.error('Error creating reading test:', error);
        res.status(500).json({ 
            error: 'Failed to create reading test',
            message: error.message 
        });
    }
});

// PUT /api/reading/tests/:id - Update bài test (Admin only)
router.put('/tests/:id', async (req, res) => {
    try {
        const updatedTest = await ReadingTest.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedTest) {
            return res.status(404).json({ error: 'Test not found' });
        }
        
        res.json({
            message: 'Test updated successfully',
            test: updatedTest
        });
    } catch (error) {
        console.error('Error updating reading test:', error);
        res.status(500).json({ 
            error: 'Failed to update reading test',
            message: error.message 
        });
    }
});

// DELETE /api/reading/tests/:id - Xóa bài test (Admin only)
router.delete('/tests/:id', async (req, res) => {
    try {
        const deletedTest = await ReadingTest.findByIdAndDelete(req.params.id);
        
        if (!deletedTest) {
            return res.status(404).json({ error: 'Test not found' });
        }
        
        res.json({
            message: 'Test deleted successfully',
            test: deletedTest
        });
    } catch (error) {
        console.error('Error deleting reading test:', error);
        res.status(500).json({ 
            error: 'Failed to delete reading test',
            message: error.message 
        });
    }
});

// GET /api/reading/tests/difficulty/:level - Lấy test theo độ khó
router.get('/tests/difficulty/:level', async (req, res) => {
    try {
        const { level } = req.params;
        const validLevels = ['Easy', 'Medium', 'Hard'];
        
        if (!validLevels.includes(level)) {
            return res.status(400).json({ 
                error: 'Invalid difficulty level',
                validLevels: validLevels 
            });
        }
        
        const tests = await ReadingTest.find({ difficulty: level })
            .sort({ createdAt: -1 });
        
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests by difficulty:', error);
        res.status(500).json({ 
            error: 'Failed to fetch tests',
            message: error.message 
        });
    }
});

// GET /api/reading/tests/type/:testType - Lấy test theo loại (Academic/General Training)
router.get('/tests/type/:testType', async (req, res) => {
    try {
        const { testType } = req.params;
        const validTypes = ['Academic', 'General Training'];
        
        if (!validTypes.includes(testType)) {
            return res.status(400).json({ 
                error: 'Invalid test type',
                validTypes: validTypes 
            });
        }
        
        const tests = await ReadingTest.find({ testType: testType })
            .sort({ createdAt: -1 });
        
        res.json(tests);
    } catch (error) {
        console.error('Error fetching tests by type:', error);
        res.status(500).json({ 
            error: 'Failed to fetch tests',
            message: error.message 
        });
    }
});

module.exports = router;