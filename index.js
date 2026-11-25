
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

const studentRoutes = require('./routes/student.routes');
const connectDB = require('./config/database');

const { MulterError } = require('multer');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'CRUD API is running successfully'
    });
});

// Student routes
app.use('/api/students', studentRoutes);

// Error handling
app.use((error, req, res, next) => {
    if (error instanceof MulterError) {
        return res.status(400).send(
            `Something went wrong: ${error.message}: ${error.code}`
        );
    }

    if (error) {
        return res.status(500).send(
            `Something went wrong: ${error.message}`
        );
    }

    next();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
connectDB();

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
