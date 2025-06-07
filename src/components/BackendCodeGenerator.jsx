"use client";

import React, { useState, useEffect } from "react";
import { CodeDisplay, createServerCode } from "./NodeGenerator";
import { ModelConfiguration } from "./Configurate";

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
    const [darkMode, setDarkMode] = useState(false);

    // Sync state with parent
    useEffect(() => {
        onStateChange({
            mongoUrl,
            models,
            generatedCode,
            port,
            activeTab,
            darkMode,
        });
    }, [mongoUrl, models, generatedCode, port, activeTab, darkMode, onStateChange]);

    // Model manipulation functions
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

    // Code generation
    const generateCode = () => {
        const generatedCode = createServerCode(models, mongoUrl, port);
        setGeneratedCode(generatedCode);
        setActiveTab("code");
    };

    const activeModel = models[activeModelIndex];
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
        "Mixed",
    ];

    return (
        <div>
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold mb-2">Node.js Backend API Generator</h2>
                </div>

                <div className="flex mb-6 border-b">
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "model"
                            ? `border-b-2 ${darkMode ? "border-white" : "border-black"} font-bold`
                            : `${darkMode ? "text-gray-400" : "text-gray-600"}`
                            }`}
                        onClick={() => setActiveTab("model")}
                    >
                        Model Configuration
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activeTab === "code"
                            ? `border-b-2 ${darkMode ? "border-white" : "border-black"} font-bold`
                            : `${darkMode ? "text-gray-400" : "text-gray-600"}`
                            }`}
                        onClick={() => setActiveTab("code")}
                        disabled={!generatedCode}
                    >
                        Generated Code
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
                        darkMode={darkMode}
                    />
                )}

                {activeTab === "code" && generatedCode && (
                    <CodeDisplay
                        generatedCode={generatedCode}
                        darkMode={darkMode}
                    />
                )}
            </div>
        </div>
    );
};

export default BackendCodeGenerator;