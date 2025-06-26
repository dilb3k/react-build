"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Settings, Code, Moon, Sun } from "lucide-react";

const ModelConfiguration = ({
    mongoUrl, setMongoUrl, port, setPort, models, activeModelIndex,
    setActiveModelIndex, activeModel, addModel, removeModel, updateModelName,
    addField, updateField, removeField, generateCode, dataTypes, theme
}) => {
    return (
        <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"}`}>
                <h3 className="text-lg font-semibold mb-4">Database Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">MongoDB URL</label>
                        <input
                            type="text"
                            value={mongoUrl}
                            onChange={(e) => setMongoUrl(e.target.value)}
                            className={`w-full p-2 border rounded-md ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-2 focus:ring-${theme === "black" ? "white" : "black"}`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Server Port</label>
                        <input
                            type="text"
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                            className={`w-full p-2 border rounded-md ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-2 focus:ring-${theme === "black" ? "white" : "black"}`}
                        />
                    </div>
                </div>
            </div>

            <div className={`p-4 rounded-lg border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Models</h3>
                    <button
                        onClick={addModel}
                        className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${theme === "black" ? "bg-white text-black" : "bg-black text-white"}`}
                    >
                        <Plus size={14} /> Add Model
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {models.map((model, index) => (
                        <div key={index} className="flex items-center">
                            <button
                                onClick={() => setActiveModelIndex(index)}
                                className={`px-3 py-1 text-sm rounded-l ${activeModelIndex === index ? `${theme === "black" ? "bg-white text-black" : "bg-black text-white"}` : `${theme === "black" ? "bg-black/50 text-white/60" : "bg-white/50 text-black/60"}`} transition-colors hover:${theme === "black" ? "bg-white/20 text-white" : "bg-black/20 text-black"}`}
                            >
                                {model.name || `Model ${index + 1}`}
                            </button>
                            {models.length > 1 && (
                                <button
                                    onClick={() => removeModel(index)}
                                    className={`px-2 py-1 rounded-r border-l ${theme === "black" ? "bg-black/50 text-white/60 border-white/20" : "bg-white/50 text-black/60 border-black/20"} hover:${theme === "black" ? "bg-white/20 text-white" : "bg-black/20 text-black"}`}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {activeModel && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Model Name</label>
                            <input
                                type="text"
                                value={activeModel.name}
                                onChange={(e) => updateModelName(activeModelIndex, e.target.value)}
                                className={`w-full p-2 border rounded-md ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-2 focus:ring-${theme === "black" ? "white" : "black"}`}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-sm font-medium">Fields</label>
                                <button
                                    onClick={() => addField(activeModelIndex)}
                                    className={`flex items-center gap-1 px-2 py-1 text-sm rounded ${theme === "black" ? "bg-white text-black" : "bg-black text-white"}`}
                                >
                                    <Plus size={12} /> Add Field
                                </button>
                            </div>

                            <div className="space-y-2">
                                {activeModel.fields.map((field, fieldIndex) => (
                                    <div key={fieldIndex} className={`flex gap-2 items-center p-2 rounded border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"}`}>
                                        <input
                                            type="text"
                                            placeholder="Field name"
                                            value={field.name}
                                            onChange={(e) => updateField(activeModelIndex, fieldIndex, "name", e.target.value)}
                                            className={`flex-1 p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                        />
                                        <select
                                            value={field.type}
                                            onChange={(e) => updateField(activeModelIndex, fieldIndex, "type", e.target.value)}
                                            className={`p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                        >
                                            {dataTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateField(activeModelIndex, fieldIndex, "required", e.target.checked)}
                                                className="rounded"
                                            />
                                            <span>Required</span>
                                        </label>
                                        <button
                                            onClick={() => removeField(activeModelIndex, fieldIndex)}
                                            className={`p-1 rounded ${theme === "black" ? "text-white/60 hover:bg-white/20 hover:text-white" : "text-black/60 hover:bg-black/20 hover:text-black"}`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={generateCode}
                            className={`w-full p-3 rounded-md text-sm font-medium ${theme === "black" ? "bg-white text-black" : "bg-black text-white"}`}
                        >
                            <Code className="inline mr-1" size={16} /> Generate Code
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const CodeDisplay = ({ generatedCode, theme }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Generated Code</h3>
                <button
                    onClick={copyToClipboard}
                    className={`px-3 py-1 text-sm rounded ${theme === "black" ? "bg-white text-black" : "bg-black text-white"}`}
                >
                    Copy Code
                </button>
            </div>
            <div className={`p-4 rounded-lg border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"} max-h-96 overflow-auto`}>
                <pre className="text-sm"><code>{generatedCode || "No code generated yet. Configure your models and click 'Generate Code'."}</code></pre>
            </div>
        </div>
    );
};

const createServerCode = (models, mongoUrl, port) => {
    return `const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('${mongoUrl}');

${models.map((model) => `
// ${model.name.charAt(0).toUpperCase() + model.name.slice(1)} Schema
const ${model.name}Schema = new mongoose.Schema({
${model.fields.map((field) => `  ${field.name}: { type: ${field.type}, required: ${field.required} }`).join(",\n")}
});

const ${model.name.charAt(0).toUpperCase() + model.name.slice(1)} = mongoose.model('${model.name.charAt(0).toUpperCase() + model.name.slice(1)}', ${model.name}Schema);

// ${model.name.charAt(0).toUpperCase() + model.name.slice(1)} Routes
app.get('/api/${model.name}s', async (req, res) => {
  try {
    const ${model.name}s = await ${model.name.charAt(0).toUpperCase() + model.name.slice(1)}.find();
    res.json(${model.name}s);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/${model.name}s', async (req, res) => {
  try {
    const ${model.name} = new ${model.name.charAt(0).toUpperCase() + model.name.slice(1)}(req.body);
    await ${model.name}.save();
    res.status(201).json(${model.name});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
`).join("")}

app.listen(${port}, () => {
  console.log(\`Server running on port ${port}\`);
});`;
};

const BackendCodeGenerator = ({ initialState, onStateChange }) => {
    const [mongoUrl, setMongoUrl] = useState(initialState?.mongoUrl || "mongodb://localhost:27017/mydb");
    const [models, setModels] = useState(
        initialState?.models || [
            {
                name: "user",
                fields: [
                    { name: "username", type: "String", required: true },
                    { name: "email", type: "String", required: true },
                    { name: "age", type: "Number", required: false },
                ],
            },
        ]
    );
    const [activeModelIndex, setActiveModelIndex] = useState(0);
    const [generatedCode, setGeneratedCode] = useState(initialState?.generatedCode || "");
    const [port, setPort] = useState(initialState?.port || "5070");
    const [activeTab, setActiveTab] = useState("model");
    const [theme, setTheme] = useState("white");

    useEffect(() => {
        if (onStateChange) {
            onStateChange({
                mongoUrl,
                models,
                generatedCode,
                port,
                activeTab,
                theme,
            });
        }
    }, [mongoUrl, models, generatedCode, port, activeTab, theme, onStateChange]);

    const addModel = () => {
        const newModel = {
            name: `model${models.length + 1}`,
            fields: [{ name: "", type: "String", required: false }],
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
        const generatedCode = createServerCode(models, mongoUrl, port);
        setGeneratedCode(generatedCode);
        setActiveTab("code");
    };

    const activeModel = models[activeModelIndex];
    const dataTypes = [
        "String", "Number", "Date", "Boolean", "Buffer",
        "ObjectId", "[String]", "[Number]", "Object", "Mixed",
    ];

    const getThemeClasses = () => {
        return theme === "black" ? "bg-black text-white" : "bg-white text-black";
    };

    return (
        <div className={`${getThemeClasses()} p-6 min-h-screen font-sans`}>
            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Node.js Code Generator</h2>
                 
                </div>

                <div className={`flex border-b ${theme === "black" ? "border-white" : "border-black"} mb-6`}>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "model" ? `${theme === "black" ? "border-b-2 border-white text-white" : "border-b-2 border-black text-black"}` : `${theme === "black" ? "text-white/60" : "text-black/60"}`} transition-colors hover:${theme === "black" ? "text-white" : "text-black"}`}
                        onClick={() => setActiveTab("model")}
                    >
                        <Settings className="inline mr-1" size={16} /> Configuration
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "code" ? `${theme === "black" ? "border-b-2 border-white text-white" : "border-b-2 border-black text-black"}` : `${theme === "black" ? "text-white/60" : "text-black/60"} ${!generatedCode ? "opacity-50 cursor-not-allowed" : ""}`} transition-colors hover:${theme === "black" ? "text-white" : "text-black"}`}
                        onClick={() => setActiveTab("code")}
                        disabled={!generatedCode}
                    >
                        <Code className="inline mr-1" size={16} /> Generated Code
                    </button>
                </div>

                {activeTab === "model" && (
                    <ModelConfiguration
                        mongoUrl={mongoUrl}
                        setMongoUrl={setMongoUrl}
                        port={port}
                        setPort={setPort}
                        models={models}
                        activeModelIndex={activeModelIndex}
                        setActiveModelIndex={setActiveModelIndex}
                        activeModel={activeModel}
                        addModel={addModel}
                        removeModel={removeModel}
                        updateModelName={updateModelName}
                        addField={addField}
                        updateField={updateField}
                        removeField={removeField}
                        generateCode={generateCode}
                        dataTypes={dataTypes}
                        theme={theme}
                    />
                )}

                {activeTab === "code" && generatedCode && (
                    <CodeDisplay
                        generatedCode={generatedCode}
                        theme={theme}
                    />
                )}
            </div>
        </div>
    );
};

export default BackendCodeGenerator;