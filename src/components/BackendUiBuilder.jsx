"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { RotateCcw, FileCode, Layout } from "lucide-react";
import BackendCodeGenerator from "./BackendCodeGenerator";
import DjangoCodeGenerator from "./DjangoCodeGenerator";
import NodeTemplatesManager from "./NodeTemplatesManager";

// Storage keys
const STORAGE_KEY = "react-ui-builder-state";
const NODE_STORAGE_KEY = "react-backend-node-state";
const DJANGO_STORAGE_KEY = "react-backend-django-state";
const TEMPLATE_STORAGE_KEY = "ui-builder-templates";
const RESET_FLAG_KEY = "react-backend-reset-flag";

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

// Default states for Node.js and Django
const DEFAULT_NODE_STATE = {
    models: [
        {
            name: "user",
            fields: [
                { name: "username", type: "String", required: true },
                { name: "email", type: "String", required: true },
                { name: "age", type: "Number", required: false },
            ],
        },
    ],
    mongoUrl: "mongodb://localhost:27017/mydb",
    port: "5070",
    generatedCode: "",
    activeTab: "model",
    theme: "white",
};

const DEFAULT_DJANGO_STATE = {
    models: [
        {
            name: "Product",
            fields: [
                { name: "name", type: "CharField", maxLength: 255, required: true },
                { name: "price", type: "DecimalField", maxDigits: 10, decimalPlaces: 2, required: true },
                { name: "description", type: "TextField", required: false },
                { name: "created_at", type: "DateTimeField", autoNowAdd: true, required: false },
            ],
        },
    ],
    appName: "myapp",
    generatedCode: { model: "", serializer: "", views: "", urls: "" },
    activeTab: "model",
    theme: "white",
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
    const [nodeState, setNodeState] = useState(DEFAULT_NODE_STATE);
    const [djangoState, setDjangoState] = useState(DEFAULT_DJANGO_STATE);
    const [activeTab, setActiveTab] = useState("node");
    const [showResetPrompt, setShowResetPrompt] = useState(false);

    // Validate columns recursively
    const validateColumns = useCallback((columns) => {
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
    }, []);

    // Load saved state on initial render
    useEffect(() => {
        try {
            // Check for reset flag
            const resetFlag = localStorage.getItem(RESET_FLAG_KEY);
            if (resetFlag === "true") {
                setShowResetPrompt(true);
                localStorage.removeItem(RESET_FLAG_KEY); // Clear the flag after reading
                return;
            }

            // Load Node.js state
            const savedNodeState = localStorage.getItem(NODE_STORAGE_KEY);
            if (savedNodeState) {
                const parsedNodeState = JSON.parse(savedNodeState);
                // Validate Node.js state
                if (parsedNodeState.models && Array.isArray(parsedNodeState.models)) {
                    setNodeState(parsedNodeState);
                } else {
                    setNodeState(DEFAULT_NODE_STATE);
                }
            }

            // Load Django state
            const savedDjangoState = localStorage.getItem(DJANGO_STORAGE_KEY);
            if (savedDjangoState) {
                const parsedDjangoState = JSON.parse(savedDjangoState);
                // Validate Django state
                if (parsedDjangoState.models && Array.isArray(parsedDjangoState.models)) {
                    setDjangoState(parsedDjangoState);
                } else {
                    setDjangoState(DEFAULT_DJANGO_STATE);
                }
            }

            // Load UI layout state
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                if (parsedState?.layout?.columns && Array.isArray(parsedState.layout.columns)) {
                    const validatedColumns = validateColumns(parsedState.layout.columns);
                    setLayout({
                        columns: validatedColumns,
                        containerWidth: parsedState.layout.containerWidth || DEFAULT_LAYOUT.containerWidth,
                    });
                }
            }
        } catch (error) {
            console.error("Failed to load saved state:", error);
            setNodeState(DEFAULT_NODE_STATE);
            setDjangoState(DEFAULT_DJANGO_STATE);
            setLayout(DEFAULT_LAYOUT);
        }
    }, [validateColumns]);

    // Save Node.js state
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(NODE_STORAGE_KEY, JSON.stringify(nodeState));
            } catch (error) {
                console.error("Failed to save Node.js state:", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [nodeState]);

    // Save Django state
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                localStorage.setItem(DJANGO_STORAGE_KEY, JSON.stringify(djangoState));
            } catch (error) {
                console.error("Failed to save Django state:", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [djangoState]);

    // Save UI state when layout changes
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                const stateToSave = { layout, timestamp: new Date().toISOString() };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
            } catch (error) {
                console.error("Failed to save state:", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [layout]);

    // Handle beforeunload to set reset flag
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // Set a flag to prompt for reset on next load
            localStorage.setItem(RESET_FLAG_KEY, "true");
            // Standard prompt (browser default)
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    // Handle reset prompt response
    const handleResetPrompt = (keepState) => {
        if (!keepState) {
            localStorage.setItem(NODE_STORAGE_KEY, JSON.stringify(DEFAULT_NODE_STATE));
            localStorage.setItem(DJANGO_STORAGE_KEY, JSON.stringify(DEFAULT_DJANGO_STATE));
            setNodeState(DEFAULT_NODE_STATE);
            setDjangoState(DEFAULT_DJANGO_STATE);
            setLayout(DEFAULT_LAYOUT);
        }
        setShowResetPrompt(false);
    };

    const resetState = useCallback(() => {
        if (window.confirm("Are you sure you want to reset the configuration? This cannot be undone.")) {
            localStorage.setItem(NODE_STORAGE_KEY, JSON.stringify(DEFAULT_NODE_STATE));
            localStorage.setItem(DJANGO_STORAGE_KEY, JSON.stringify(DEFAULT_DJANGO_STATE));
            localStorage.removeItem(STORAGE_KEY);
            setNodeState(DEFAULT_NODE_STATE);
            setDjangoState(DEFAULT_DJANGO_STATE);
            setLayout(DEFAULT_LAYOUT);
        }
    }, []);

    const saveTemplate = useCallback(() => {
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
                backendState: activeTab === "node" ? nodeState : djangoState,
                framework: activeTab,
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
    }, [templateName, templateCategory, layout, nodeState, djangoState, activeTab]);

    const handleLoadTemplate = useCallback((template) => {
        setLayout(template.layout);
        if (template.framework === "node") {
            setNodeState(template.backendState || DEFAULT_NODE_STATE);
            setDjangoState(DEFAULT_DJANGO_STATE);
            setActiveTab("node");
        } else if (template.framework === "django") {
            setDjangoState(template.backendState || DEFAULT_DJANGO_STATE);
            setNodeState(DEFAULT_NODE_STATE);
            setActiveTab("django");
        }
        setSelectedComponentId(null);
        setSelectedColumnId(null);
        setShowTemplates(false);
    }, []);

    if (showTemplates) {
        return (
            <NodeTemplatesManager
                onBack={() => setShowTemplates(false)}
                onLoadTemplate={handleLoadTemplate}
                onCreateNew={() => {
                    setLayout(DEFAULT_LAYOUT);
                    setNodeState(DEFAULT_NODE_STATE);
                    setDjangoState(DEFAULT_DJANGO_STATE);
                    setShowTemplates(false);
                }}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen">
            <header className="p-4 flex justify-between items-center shadow-md">
                <div className="flex space-x-10 items-center">
                    <Link to="/">
                        <h1
                            className={`text-2xl font-mono font-bold text-black ${isHomePage ? "underline decoration-2 underline-offset-4" : ""}`}
                        >
                            Backend Builder
                        </h1>
                    </Link>
                    <p className="text-2xl font-base text-gray-500">|</p>
                    <Link to="/frontend">
                        <h1
                            className={`text-2xl font-mono font-bold text-black ${isBackendPage ? "underline decoration-2 underline-offset-4" : ""}`}
                        >
                            Frontend Builder
                        </h1>
                    </Link>
                </div>
                <div className="flex space-x-2 font-semibold">
                    <button
                        className="px-4 py-2 bg-white hover:bg-black border border-black rounded-md text-sm font-mono flex items-center transition-colors"
                        onClick={resetState}
                    >
                        <RotateCcw className="h-4 w-4 mr-2 text-black" />
                        <span>Reset</span>
                    </button>
                    <button
                        className="px-3 py-1 border bg-white border-black rounded-md text-sm flex items-center"
                        onClick={() => setShowTemplates(true)}
                    >
                        <Layout className="h-4 w-4 mr-1" />
                        Templates
                    </button>
                    <button
                        className="px-4 py-2 text-black rounded-md border border-black text-sm font-mono flex items-center"
                        onClick={() => setSaveTemplateDialogOpen(true)}
                    >
                        Save Template
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <div className="p-4">
                    {/* Tab Navigation */}
                    <div className="flex space-x-4 border-b border-gray-200 mb-4">
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeTab === "node" ? "border-b-2 border-black text-black" : "text-gray-500"}`}
                            onClick={() => setActiveTab("node")}
                        >
                            Node.js Generator
                        </button>
                        <p className="text-xl font-base text-gray-700">|</p>
                        <button
                            className={`px-4 py-2 text-sm font-medium ${activeTab === "django" ? "border-b-2 border-black text-black" : "text-gray-500"}`}
                            onClick={() => setActiveTab("django")}
                        >
                            Django Generator
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="h-[calc(100vh-180px)] overflow-auto">
                        {activeTab === "node" && (
                            <BackendCodeGenerator
                                initialState={nodeState}
                                onStateChange={setNodeState}
                            />
                        )}
                        {activeTab === "django" && (
                            <DjangoCodeGenerator
                                initialState={djangoState}
                                onStateChange={setDjangoState}
                            />
                        )}
                    </div>
                </div>
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
                                className="px-4 py-2 text-black rounded-md border border-gray-300"
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