import React, { useState } from "react";

const BackendCodeGenerator = () => {
    const [mongoUrl, setMongoUrl] = useState("mongodb://localhost:27017/mydb");
    const [models, setModels] = useState([
        {
            name: "user",
            fields: [
                { name: "username", type: "String", required: true },
                { name: "email", type: "String", required: true },
                { name: "age", type: "Number", required: false }
            ]
        }
    ]);
    const [activeModelIndex, setActiveModelIndex] = useState(0);
    const [generatedCode, setGeneratedCode] = useState("");
    const [port, setPort] = useState("5070");
    const [activeTab, setActiveTab] = useState("model");
    const [darkMode, setDarkMode] = useState(false);
    const [copied, setCopied] = useState(false);

    const dataTypes = [
        "String",
        "Number",
        "Date",
        "Boolean",
        "Buffer",
        "ObjectId",
        "[String]",
        "[Number]",
        "Object",
        "Mixed"
    ];

    const addModel = () => {
        const newModel = {
            name: `model${models.length + 1}`,
            fields: [{ name: "", type: "String", required: false }]
        };
        setModels([...models, newModel]);
        setActiveModelIndex(models.length);
    };

    const removeModel = (index) => {
        if (models.length <= 1) return;
        setModels(models.filter((_, i) => i !== index));
        setActiveModelIndex(Math.min(activeModelIndex, models.length - 2));
    };

    const updateModelName = (index, name) => {
        const newModels = [...models];
        newModels[index].name = name.toLowerCase();
        setModels(newModels);
    };

    const addField = (modelIndex) => {
        const newModels = [...models];
        newModels[modelIndex].fields.push({ name: "", type: "String", required: false });
        setModels(newModels);
    };

    const updateField = (modelIndex, fieldIndex, key, value) => {
        const newModels = [...models];
        newModels[modelIndex].fields[fieldIndex][key] = value;
        setModels(newModels);
    };

    const removeField = (modelIndex, fieldIndex) => {
        const newModels = [...models];
        newModels[modelIndex].fields = newModels[modelIndex].fields.filter((_, i) => i !== fieldIndex);
        setModels(newModels);
    };

    const generateCode = () => {
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

        const modelSchemas = models.map(model => {
            const camelCaseModel = model.name.charAt(0).toUpperCase() + model.name.slice(1);

            const schemaFields = model.fields
                .map(field => {
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
        }).join("\n");

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

        const routes = models.map(model => {
            const camelCaseModel = model.name.charAt(0).toUpperCase() + model.name.slice(1);
            return `app.use('/${model.name}s', createCRUDRoutes(${camelCaseModel}, '${camelCaseModel}'));`;
        }).join("\n");

        const serverSetup = `
// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    endpoints: [
      ${models.map(model => `'/${model.name}s'`).join(", ")}
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
      ${models.map(model => `console.log(\`${model.name}s API: http://localhost:\${PORT}/${model.name}s\`);`).join("\n      ")}
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();`;

        const fullCode = [imports, appSetup, modelSchemas, crudGenerator, routes, serverSetup].join("\n");
        setGeneratedCode(fullCode);
        setActiveTab("code");
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const activeModel = models[activeModelIndex];

    return (
       <div>
        <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold mb-2">Node.js Backend API Generator</h2>
                   
                </div>

                {/* Tabs navigation */}
                <div className="flex mb-6 border-b">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "model" ? `border-b-2 ${darkMode ? 'border-white' : 'border-black'} font-bold` : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`}`}
                        onClick={() => setActiveTab("model")}
                    >
                        Model Configuration
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "code" ? `border-b-2 ${darkMode ? 'border-white' : 'border-black'} font-bold` : `${darkMode ? 'text-gray-400' : 'text-gray-600'}`}`}
                        onClick={() => setActiveTab("code")}
                        disabled={!generatedCode}
                    >
                        Generated Code
                    </button>
                </div>

                {activeTab === "model" && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>MongoDB Connection URL</label>
                                <input
                                    type="text"
                                    value={mongoUrl}
                                    onChange={(e) => setMongoUrl(e.target.value)}
                                    className={`block w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 focus:border-white' : 'border-gray-300 focus:border-black'} focus:ring-1 ${darkMode ? 'focus:ring-white' : 'focus:ring-black'}`}
                                    placeholder="mongodb://localhost:27017/myDatabase"
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Server Port</label>
                                <input
                                    type="text"
                                    value={port}
                                    onChange={(e) => setPort(e.target.value)}
                                    className={`block w-full p-2 rounded border ${darkMode ? 'bg-gray-700 border-gray-600 focus:border-white' : 'border-gray-300 focus:border-black'} focus:ring-1 ${darkMode ? 'focus:ring-white' : 'focus:ring-black'}`}
                                    placeholder="5070"
                                />
                            </div>
                        </div>

                        {/* Model tabs */}
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {models.map((model, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveModelIndex(index)}
                                        className={`px-3 py-1 rounded-t-md ${activeModelIndex === index ? (darkMode ? 'bg-gray-700' : 'bg-gray-200') : (darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200')}`}
                                    >
                                        {model.name}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeModel(index); }}
                                            className="ml-2 text-xs"
                                            disabled={models.length <= 1}
                                        >
                                            ×
                                        </button>
                                    </button>
                                ))}
                                <button
                                    onClick={addModel}
                                    className={`px-3 py-1 rounded-md ${darkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    + Add Model
                                </button>
                            </div>

                            {/* Active model content */}
                            <div className={`p-4 rounded-b-md rounded-r-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                <div className="mb-4">
                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Model Name (singular)</label>
                                    <input
                                        type="text"
                                        value={activeModel.name}
                                        onChange={(e) => updateModelName(activeModelIndex, e.target.value)}
                                        className={`block w-full p-2 rounded border ${darkMode ? 'bg-gray-600 border-gray-500 focus:border-white' : 'border-gray-300 focus:border-black'} focus:ring-1 ${darkMode ? 'focus:ring-white' : 'focus:ring-black'}`}
                                        placeholder="e.g., user, product, post"
                                    />
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Schema Fields</label>
                                        <button
                                            onClick={() => addField(activeModelIndex)}
                                            className={`px-3 py-1 ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} text-sm rounded`}
                                        >
                                            + Add Field
                                        </button>
                                    </div>

                                    {/* Field headers */}
                                    <div className={`grid grid-cols-12 gap-2 mb-1 text-sm font-medium px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <div className="col-span-5">Field Name</div>
                                        <div className="col-span-4">Data Type</div>
                                        <div className="col-span-2">Required</div>
                                        <div className="col-span-1"></div>
                                    </div>

                                    {/* Fields list */}
                                    <div className="space-y-2 mb-4">
                                        {activeModel.fields.map((field, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                                <div className="col-span-5">
                                                    <input
                                                        type="text"
                                                        value={field.name}
                                                        onChange={(e) => updateField(activeModelIndex, index, "name", e.target.value)}
                                                        placeholder="Field name"
                                                        className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-600 border-gray-500 focus:border-white' : 'border-gray-300 focus:border-black'} focus:ring-1 ${darkMode ? 'focus:ring-white' : 'focus:ring-black'}`}
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => updateField(activeModelIndex, index, "type", e.target.value)}
                                                        className={`w-full p-2 rounded border ${darkMode ? 'bg-gray-600 border-gray-500 focus:border-white' : 'border-gray-300 focus:border-black'} focus:ring-1 ${darkMode ? 'focus:ring-white' : 'focus:ring-black'}`}
                                                    >
                                                        {dataTypes.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-2 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(activeModelIndex, index, "required", e.target.checked)}
                                                        className={`mr-2 h-4 w-4 ${darkMode ? 'border-gray-500 bg-gray-600' : 'border-gray-300'} rounded ${darkMode ? 'focus:ring-white' : 'focus:ring-black'}`}
                                                    />
                                                    <span className="text-sm">Required</span>
                                                </div>
                                                <div className="col-span-1 text-right">
                                                    <button
                                                        onClick={() => removeField(activeModelIndex, index)}
                                                        className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
                                                        title="Remove field"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={generateCode}
                                disabled={!mongoUrl || models.some(model => !model.name || model.fields.some(f => !f.name))}
                                className={`px-6 py-3 rounded-md font-medium ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'} text-white ${(!mongoUrl || models.some(model => !model.name || model.fields.some(f => !f.name))) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Generate API Code
                            </button>
                        </div>
                    </>
                )}

                {activeTab === "code" && generatedCode && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Generated Node.js API Code</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className={`px-4 py-2 rounded ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} flex items-center`}
                                >
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                                <button
                                    onClick={downloadCode}
                                    className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-black hover:bg-gray-800'} text-white flex items-center`}
                                >
                                    Download server.js
                                </button>
                            </div>
                        </div>
                        <pre className={`p-4 rounded-md overflow-auto max-h-96 text-sm border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} font-mono`}>
                            {generatedCode}
                        </pre>
                        <div className={`mt-6 p-4 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Next Steps:</h4>
                            <ol className={`list-decimal list-inside space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <li>Download the generated code as <code className={`px-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>server.js</code></li>
                                <li>Run <code className={`px-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>npm init -y</code> to create a package.json file</li>
                                <li>Install dependencies: <code className={`px-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>npm install express mongoose cors body-parser</code></li>
                                <li>Start your server: <code className={`px-1 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>node server.js</code></li>
                                <li>Test your API endpoints with Postman or cURL</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BackendCodeGenerator;