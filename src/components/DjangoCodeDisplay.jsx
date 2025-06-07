"use client";

import React, { useState, useEffect } from "react";
import { createDjangoServerCode } from "./DjangoCodeGenerator";
import { CodeDisplay } from "./NodeGenerator";

const DjangoCodeDisplay = ({ initialState, onStateChange }) => {
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

    const [generatedCode, setGeneratedCode] = useState(initialState?.generatedDjangoCode || null);
    const [dbSettings, setDbSettings] = useState(initialState?.dbSettings || {
        type: 'sqlite',
        name: 'django_db',
        user: 'postgres',
        password: 'password',
        host: 'localhost',
        port: '5432'
    });
    const [activeCodeTab, setActiveCodeTab] = useState("models");
    const [darkMode, setDarkMode] = useState(initialState?.darkMode || false);

    // Generate code on initial render if not already generated
    useEffect(() => {
        if (!generatedCode && models) {
            generateCode();
        }
    }, []);

    // Update parent state
    useEffect(() => {
        onStateChange({
            ...initialState,
            generatedDjangoCode: generatedCode,
            dbSettings: dbSettings,
            darkMode: darkMode
        });
    }, [generatedCode, dbSettings, darkMode, initialState, onStateChange]);

    // Sync models from parent state
    useEffect(() => {
        if (initialState?.models) {
            setModels(initialState.models);
        }
    }, [initialState?.models]);

    // Generate code
    const generateCode = () => {
        const code = createDjangoServerCode(models, dbSettings);
        setGeneratedCode(code);
    };

    const downloadFile = (content, fileName, contentType) => {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    };

    const downloadCurrentFile = () => {
        let fileName;
        let content;

        if (activeCodeTab === "models") {
            fileName = "models.py";
            content = generatedCode.modelsCode;
        } else if (activeCodeTab === "serializers") {
            fileName = "serializers.py";
            content = generatedCode.serializersCode;
        } else if (activeCodeTab === "views") {
            fileName = "views.py";
            content = generatedCode.viewsCode;
        } else if (activeCodeTab === "urls") {
            fileName = "urls.py";
            content = generatedCode.urlsCode;
        } else if (activeCodeTab === "settings") {
            fileName = "settings_snippet.py";
            content = generatedCode.settingsCode;
        }

        downloadFile(content, fileName, "text/plain");
    };

    // If no code is generated yet, generate it
    if (!generatedCode) {
        return (
            <div className="flex justify-center items-center h-96">
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={generateCode}
                >
                    Generate Django Code
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold mb-2">Django REST API Code</h2>
                <div className="flex space-x-2">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={downloadCurrentFile}
                    >
                        Download {activeCodeTab}.py
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Database Type</label>
                <div className="flex space-x-4">
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="sqlite"
                            name="dbType"
                            value="sqlite"
                            checked={dbSettings.type === 'sqlite'}
                            onChange={() => setDbSettings({ ...dbSettings, type: 'sqlite' })}
                            className="mr-2"
                        />
                        <label htmlFor="sqlite">SQLite</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="postgres"
                            name="dbType"
                            value="postgres"
                            checked={dbSettings.type === 'postgres'}
                            onChange={() => setDbSettings({ ...dbSettings, type: 'postgres' })}
                            className="mr-2"
                        />
                        <label htmlFor="postgres">PostgreSQL</label>
                    </div>
                </div>
            </div>

            {dbSettings.type === 'postgres' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Database Name</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={dbSettings.name}
                            onChange={(e) => setDbSettings({ ...dbSettings, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">User</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={dbSettings.user}
                            onChange={(e) => setDbSettings({ ...dbSettings, user: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded-md"
                            value={dbSettings.password}
                            onChange={(e) => setDbSettings({ ...dbSettings, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Host</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={dbSettings.host}
                            onChange={(e) => setDbSettings({ ...dbSettings, host: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Port</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded-md"
                            value={dbSettings.port}
                            onChange={(e) => setDbSettings({ ...dbSettings, port: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="flex mb-4 border-b">
                <button
                    className={`px-4 py-2 ${activeCodeTab === "models" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveCodeTab("models")}
                >
                    models.py
                </button>
                <button
                    className={`px-4 py-2 ${activeCodeTab === "serializers" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveCodeTab("serializers")}
                >
                    serializers.py
                </button>
                <button
                    className={`px-4 py-2 ${activeCodeTab === "views" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveCodeTab("views")}
                >
                    views.py
                </button>
                <button
                    className={`px-4 py-2 ${activeCodeTab === "urls" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveCodeTab("urls")}
                >
                    urls.py
                </button>
                <button
                    className={`px-4 py-2 ${activeCodeTab === "settings" ? "border-b-2 border-blue-500" : ""}`}
                    onClick={() => setActiveCodeTab("settings")}
                >
                    settings.py
                </button>
            </div>

            <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mb-4"
                onClick={generateCode}
            >
                Regenerate Code
            </button>

            <CodeDisplay
                generatedCode={
                    activeCodeTab === "models" ? generatedCode.modelsCode :
                        activeCodeTab === "serializers" ? generatedCode.serializersCode :
                            activeCodeTab === "views" ? generatedCode.viewsCode :
                                activeCodeTab === "urls" ? generatedCode.urlsCode :
                                    generatedCode.settingsCode
                }
                darkMode={darkMode}
            />
        </div>
    );
};

export default DjangoCodeDisplay;