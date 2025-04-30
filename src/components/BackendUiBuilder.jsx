"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { RotateCcw, FileCode, Layout, Code, Settings } from "lucide-react";
import BackendCodeGenerator from "./BackendCodeGenerator";
import NodeTemplatesManager from "./NodeTemplatesManager";

// Storage keys
const STORAGE_KEY = "react-ui-builder-state";
const BACKEND_STORAGE_KEY = "react-backend-builder-state";
const TEMPLATE_STORAGE_KEY = "ui-builder-templates";

// Default layout
const DEFAULT_LAYOUT = {
    columns: [
        {
            id: "column-1",
            width: 12,
            components: [],
            orientation: "horizontal",
            childColumns: [],
        },
    ],
    containerWidth: "auto",
};

function BackendUIBuilder() {
    const location = useLocation();
    const isHomePage = location.pathname === "/";
    const isBackendPage = location.pathname === "/backend";

    const [layout, setLayout] = useState(DEFAULT_LAYOUT);
    const [selectedComponentId, setSelectedComponentId] = useState(null);
    const [selectedColumnId, setSelectedColumnId] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
    const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [templateCategory, setTemplateCategory] = useState("general");
    const [backendState, setBackendState] = useState(null);
    const [activeTab, setActiveTab] = useState("generator");

    // Load saved state on initial render
    useEffect(() => {
        try {
            // Load backend state
            const savedBackendState = localStorage.getItem(BACKEND_STORAGE_KEY);
            if (savedBackendState) {
                setBackendState(JSON.parse(savedBackendState));
            }

            // Load UI state
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                if (parsedState && parsedState.layout && Array.isArray(parsedState.layout.columns)) {
                    const validatedColumns = validateColumns(parsedState.layout.columns);
                    setLayout({
                        columns: validatedColumns,
                        containerWidth: parsedState.layout.containerWidth || DEFAULT_LAYOUT.containerWidth,
                    });
                } else {
                    console.warn("Invalid saved state format, using default layout");
                    setLayout(DEFAULT_LAYOUT);
                }
            }
        } catch (error) {
            console.error("Failed to load saved state:", error);
            setLayout(DEFAULT_LAYOUT);
        }
    }, []);

    // Validate columns recursively
    const validateColumns = (columns) => {
        return columns.map((column) => ({
            id: column.id || `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            width: typeof column.width === "number" ? column.width : 12,
            components: Array.isArray(column.components) ? column.components : [],
            orientation: column.orientation === "vertical" ? "vertical" : "horizontal",
            parentId: column.parentId || null,
            childColumns: Array.isArray(column.childColumns) ? validateColumns(column.childColumns) : [],
            flexLayout: column.flexLayout || "items-start justify-start",
            gap: column.gap || "0",
            backgroundColor: column.backgroundColor || "transparent",
            borderRadius: column.borderRadius || "0",
            border: column.border || "none",
        }));
    };

    // Save UI state when layout changes
    useEffect(() => {
        try {
            const stateToSave = {
                layout,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save state:", error);
        }
    }, [layout]);

    // Save backend state when it changes
    useEffect(() => {
        if (backendState) {
            try {
                localStorage.setItem(BACKEND_STORAGE_KEY, JSON.stringify(backendState));
            } catch (error) {
                console.error("Failed to save backend state:", error);
            }
        }
    }, [backendState]);

    const resetState = () => {
        if (window.confirm("Are you sure you want to reset the configuration? This cannot be undone.")) {
            localStorage.removeItem(BACKEND_STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY);
            setBackendState(null);
            setLayout(DEFAULT_LAYOUT);
            alert("Configuration reset to default.");
        }
    };

    const saveTemplate = () => {
        if (!templateName) {
            alert("Template name is required");
            return;
        }
        try {
            const savedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
            const templates = savedTemplates ? JSON.parse(savedTemplates) : [];

            const newTemplate = {
                id: `template-${Date.now()}`,
                name: templateName,
                category: templateCategory,
                layout,
                backendState,
                createdAt: new Date().toISOString(),
            };

            templates.push(newTemplate);
            localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
            alert(`Template "${templateName}" saved successfully.`);
            setSaveTemplateDialogOpen(false);
            setTemplateName("");
            setTemplateCategory("general");
        } catch (error) {
            console.error("Failed to save template:", error);
            alert("Failed to save template. Please try again.");
        }
    };

    const handleLoadTemplate = (template) => {
        setLayout(template.layout);
        setBackendState(template.backendState || null);
        setSelectedComponentId(null);
        setSelectedColumnId(null);
        setShowTemplates(false);
        alert("Template loaded successfully.");
    };

    const handleBackendStateChange = (newState) => {
        setBackendState(newState);
    };

    if (showTemplates) {
        return (
            <NodeTemplatesManager
                onBack={() => setShowTemplates(false)}
                onLoadTemplate={handleLoadTemplate}
                onCreateNew={() => {
                    setLayout(DEFAULT_LAYOUT);
                    setBackendState(null);
                    setShowTemplates(false);
                }}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div className="flex space-x-10 items-center">
                    <Link to="/">
                        <h1
                            className={`text-2xl font-mono font-bold text-black ${isHomePage ? "underline decoration-2 underline-offset-4" : ""
                                }`}
                        >
                            Frontend Builder
                        </h1>
                    </Link>
                    <Link to="/backend">
                        <h1
                            className={`text-2xl font-mono font-bold text-black ${isBackendPage ? "underline decoration-2 underline-offset-4" : ""
                                }`}
                        >
                            Backend Builder
                        </h1>
                    </Link>
                </div>
                <div className="flex space-x-2">
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                        onClick={() => setShowTemplates(true)}
                    >
                        <Layout className="h-4 w-4 mr-1" />
                        Templates
                    </button>
             
                    <button
                        className="px-4 py-2 bg-white hover:bg-gray-100 border border-black rounded-none text-sm font-mono font-medium flex items-center transition-colors"
                        onClick={resetState}
                    >
                        <RotateCcw className="h-4 w-4 mr-2 text-black" />
                        <span>Reset</span>
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-mono font-medium flex items-center"
                        onClick={() => setSaveTemplateDialogOpen(true)}
                    >
                        Save Template
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                {activeTab === "generator" ? (
                    <div className="p-4 h-full overflow-auto">
                        <BackendCodeGenerator
                            initialState={backendState}
                            onStateChange={handleBackendStateChange}
                        />
                    </div>
                ) : (
                    <div className="p-4 h-full overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Generated Backend Code</h2>
                            <button
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                                onClick={() => setActiveTab("generator")}
                            >
                                <Settings className="h-4 w-4 mr-1" />
                                Back to Generator
                            </button>
                        </div>
                        {backendState && backendState.generatedCode ? (
                            <div className="border border-gray-300 rounded-md overflow-hidden">
                                <pre className="bg-gray-50 p-4 rounded-md overflow-auto h-[calc(100vh-200px)] text-sm">
                                    <code>{backendState.generatedCode}</code>
                                </pre>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[calc(100vh-200px)] border border-gray-300 rounded-md">
                                <div className="text-center">
                                    <FileCode className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">Generate code first to see the preview</p>
                                    <button
                                        className="mt-4 px-4 py-2 bg-black text-white rounded-md"
                                        onClick={() => setActiveTab("generator")}
                                    >
                                        Go to Generator
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {saveTemplateDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-semibold mb-4">Save Template</h2>
                        <p className="text-gray-600 mb-4">Save your current layout and backend configuration.</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="My Template"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={templateCategory}
                                onChange={(e) => setTemplateCategory(e.target.value)}
                            >
                                <option value="general">General</option>
                                <option value="forms">Forms</option>
                                <option value="landing">Landing Pages</option>
                                <option value="dashboard">Dashboards</option>
                                <option value="backend">Backend</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                onClick={() => {
                                    setSaveTemplateDialogOpen(false);
                                    setTemplateName("");
                                    setTemplateCategory("general");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                onClick={saveTemplate}
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BackendUIBuilder;