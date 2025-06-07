"use client";

import React, { useState } from "react";

// Code Display Component
export const CodeDisplay = ({ generatedCode, darkMode }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCode = () => {
        const blob = new Blob([generatedCode], { type: "text/javascript" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "server.js";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Generated Node.js API Code
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={copyToClipboard}
                        className={`px-4 py-2 rounded ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"} flex items-center`}
                    >
                        {copied ? "Copied!" : "Copy Code"}
                    </button>
                    <button
                        onClick={downloadCode}
                        className={`px-4 py-2 rounded ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-black hover:bg-gray-800"} text-white flex items-center`}
                    >
                        Download server.js
                    </button>
                </div>
            </div>
            <pre
                className={`p-4 rounded-md overflow-auto max-h-96 text-sm border ${darkMode ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-200"} font-mono`}
            >
                {generatedCode}
            </pre>
            <div
                className={`mt-6 p-4 rounded border ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"}`}
            >
                <h4 className={`font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Next Steps:
                </h4>
                <ol className={`list-decimal list-inside space-y-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    <li>
                        Download the generated code as{" "}
                        <code className={`px-1 rounded ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>
                            server.js
                        </code>
                    </li>
                    <li>
                        Run{" "}
                        <code className={`px-1 rounded ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>
                            npm init -y
                        </code>{" "}
                        to create a package.json file
                    </li>
                    <li>
                        Install dependencies:{" "}
                        <code className={`px-1 rounded ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>
                            npm install express mongoose cors body-parser
                        </code>
                    </li>
                    <li>
                        Start your server:{" "}
                        <code className={`px-1 rounded ${darkMode ? "bg-gray-600" : "bg-gray-100"}`}>
                            node server.js
                        </code>
                    </li>
                    <li>Test your API endpoints with Postman or cURL</li>
                </ol>
            </div>
        </div>
    );
};

// Code Generation Logic
export const createServerCode = (models, mongoUrl, port) => {
    const imports = `
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");`;

    const appSetup = `
// App initialization
const app = express();
const PORT = process.env.PORT || ${port};

// MongoDB connection URL
const dbURI = "${mongoUrl}";

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));`;

    const modelSchemas = models
        .map((model) => {
            const camelCaseModel = model.name.charAt(0).toUpperCase() + model.name.slice(1);
            const schemaFields = model.fields
                .map((field) => {
                    if (field.required) {
                        return `  ${field.name}: { type: ${field.type}, required: true }`;
                    }
                    return `  ${field.name}: ${field.type}`;
                })
                .join(",\n");

            return `
// ${camelCaseModel} Schema
const ${model.name}Schema = new mongoose.Schema({
${schemaFields}
}, { timestamps: true });

const ${camelCaseModel} = mongoose.model("${camelCaseModel}", ${model.name}Schema);`;
        })
        .join("\n");

    const crudGenerator = `
// CRUD route generator
const createCRUDRoutes = (model, modelName) => {
  const router = express.Router();

  // GET All items with pagination
  router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      
      const items = await model.find().skip(skip).limit(limit);
      const total = await model.countDocuments();
      
      res.json({
        items,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      });
    } catch (err) {
      console.error(\`GET /\${modelName.toLowerCase()} error:\`, err);
      res.status(500).json({ message: err.message });
    }
  });

  // GET Single item by ID
  router.get('/:id', getItem(model, modelName), (req, res) => {
    res.json(res.item);
  });

  // POST New item
  router.post('/', async (req, res) => {
    try {
      const item = new model(req.body);
      const newItem = await item.save();
      res.status(201).json(newItem);
    } catch (err) {
      console.error(\`POST /\${modelName.toLowerCase()} error:\`, err);
      res.status(400).json({ message: err.message });
    }
  });

  // PUT Update item by ID
  router.put('/:id', getItem(model, modelName), async (req, res) => {
    try {
      Object.assign(res.item, req.body);
      const updatedItem = await res.item.save();
      res.json(updatedItem);
    } catch (err) {
      console.error(\`PUT /\${modelName.toLowerCase()}/\${req.params.id} error:\`, err);
      res.status(400).json({ message: err.message });
    }
  });

  // PATCH Partial update
  router.patch('/:id', getItem(model, modelName), async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      updates.forEach(update => res.item[update] = req.body[update]);
      const updatedItem = await res.item.save();
      res.json(updatedItem);
    } catch (err) {
      console.error(\`PATCH /\${modelName.toLowerCase()}/\${req.params.id} error:\`, err);
      res.status(400).json({ message: err.message });
    }
  });

  // DELETE Item by ID
  router.delete('/:id', getItem(model, modelName), async (req, res) => {
    try {
      await res.item.remove();
      res.json({ message: \`\${modelName} deleted\` });
    } catch (err) {
      console.error(\`DELETE /\${modelName.toLowerCase()}/\${req.params.id} error:\`, err);
      res.status(500).json({ message: err.message });
    }
  });

  // SEARCH Items
  router.get('/search/:query', async (req, res) => {
    try {
      const searchQuery = req.params.query;
      const schema = model.schema.obj;
      
      const stringFields = Object.keys(schema).filter(
        key => schema[key] === String || (schema[key].type && schema[key].type === String)
      );
      
      const searchConditions = stringFields.map(field => ({
        [field]: { $regex: searchQuery, $options: 'i' }
      }));
      
      const items = await model.find(searchConditions.length > 0 ? { $or: searchConditions } : {});
      res.json(items);
    } catch (err) {
      console.error(\`SEARCH /\${modelName.toLowerCase()} error:\`, err);
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};

// Middleware: Fetch an item by ID
function getItem(model, modelName) {
  return async (req, res, next) => {
    let item;
    try {
      item = await model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: \`\${modelName} not found\` });
      }
    } catch (err) {
      console.error(\`GET_ITEM /\${modelName.toLowerCase()}/\${req.params.id} error:\`, err);
      return res.status(500).json({ message: err.message });
    }

    res.item = item;
    next();
  };
}`;

    const routes = models
        .map((model) => {
            const camelCaseModel = model.name.charAt(0).toUpperCase() + model.name.slice(1);
            return `app.use('/${model.name}s', createCRUDRoutes(${camelCaseModel}, '${camelCaseModel}'));`;
        })
        .join("\n");

    const serverSetup = `
// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    endpoints: [
      ${models.map((model) => `'/${model.name}s'`).join(", ")}
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB connection and server startup
const startServer = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
      ${models
            .map(
                (model) =>
                    `console.log(\`${model.name}s API: http://localhost:\${PORT}/${model.name}s\`);`
            )
            .join("\n      ")}
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();`;

    return [imports, appSetup, modelSchemas, crudGenerator, routes, serverSetup].join("\n");
};