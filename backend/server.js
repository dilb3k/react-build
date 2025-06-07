require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : 'http://localhost:3000',
    credentials: true
}));

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

const RENDER_API_URL = 'https://api.render.com/v1';

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Explicitly reject GET requests to deploy endpoint
app.get('/api/deploy-to-render', (req, res) => {
    res.status(405).json({
        error: 'Method Not Allowed',
        message: 'This endpoint only accepts POST requests'
    });
});

// Deployment endpoint
app.post('/api/deploy-to-render', upload.single('zipFile'), async (req, res) => {
    try {
        // Validate required fields
        const { projectName, mongoUrl } = req.body;
        if (!projectName || !mongoUrl) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['projectName', 'mongoUrl']
            });
        }

        // Validate Render API key
        const RENDER_API_KEY = process.env.RENDER_API_KEY;
        if (!RENDER_API_KEY) {
            throw new Error('Render API key not configured');
        }

        // Create service on Render
        const serviceResponse = await axios.post(
            `${RENDER_API_URL}/services`,
            {
                type: 'web_service',
                name: projectName,
                env: 'node',
                autoDeploy: false,
                serviceDetails: {
                    envVars: [
                        { key: 'NODE_ENV', value: 'production' },
                        { key: 'MONGODB_URI', value: mongoUrl },
                        { key: 'PORT', value: '10000' }
                    ],
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${RENDER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const serviceId = serviceResponse.data.id;

        // Upload deployment package
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), {
            filename: 'deployment.zip',
            contentType: 'application/zip'
        });

        await axios.post(
            `${RENDER_API_URL}/services/${serviceId}/deploys`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${RENDER_API_KEY}`,
                    ...formData.getHeaders(),
                    'Content-Length': formData.getLengthSync()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        res.json({
            success: true,
            url: `https://${projectName}.onrender.com`,
            serviceId,
            message: 'Deployment initiated. It may take several minutes to become available.'
        });

    } catch (error) {
        console.error('Deployment error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            error: error.response?.data?.message || error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        // Clean up uploaded file
        if (req.file?.path) {
            fs.unlink(req.file.path, console.error);
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Deploy endpoint: POST http://localhost:${PORT}/api/deploy-to-render`);
});