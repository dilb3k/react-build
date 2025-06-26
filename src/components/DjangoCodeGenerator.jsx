"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Plus, Settings, Code, Moon, Sun } from "lucide-react";

const DjangoCodeGenerator = ({ initialState, onStateChange }) => {
    const [models, setModels] = useState(
        initialState?.models || [
            {
                name: "Product",
                fields: [
                    { name: "name", type: "CharField", maxLength: 255, required: true },
                    { name: "price", type: "DecimalField", maxDigits: 10, decimalPlaces: 2, required: true },
                    { name: "description", type: "TextField", required: false },
                    { name: "created_at", type: "DateTimeField", autoNowAdd: true, required: false },
                ],
            },
        ]
    );
    const [activeModelIndex, setActiveModelIndex] = useState(0);
    const [generatedCode, setGeneratedCode] = useState(
        initialState?.generatedCode || {
            model: "",
            serializer: "",
            views: "",
            urls: "",
        }
    );
    const [appName, setAppName] = useState(initialState?.appName || "myapp");
    const [activeTab, setActiveTab] = useState("model");
    const [codeTab, setCodeTab] = useState("model");
    const [theme, setTheme] = useState("white"); // white, black

    useEffect(() => {
        onStateChange({
            models,
            generatedCode,
            appName,
            activeTab,
            theme,
        });
    }, [models, generatedCode, appName, activeTab, theme, onStateChange]);

    const addModel = () => {
        const newModel = {
            name: `Model${models.length + 1}`,
            fields: [{ name: "", type: "CharField", maxLength: 255, required: false }],
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
        newModels[index].name = name.trim() || `Model${index + 1}`;
        setModels(newModels);
    };

    const addField = (modelIndex) => {
        const newModels = [...models];
        newModels[modelIndex].fields.push({
            name: "",
            type: "CharField",
            maxLength: 255,
            required: false,
        });
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

    const generateModelCode = (model) => {
        let code = `from django.db import models\n\n`;
        code += `class ${model.name}(models.Model):\n`;
        model.fields.forEach((field) => {
            let fieldCode = `    ${field.name} = models.`;
            switch (field.type) {
                case "CharField":
                    fieldCode += `CharField(max_length=${field.maxLength || 255}`;
                    break;
                case "TextField":
                    fieldCode += `TextField(`;
                    break;
                case "IntegerField":
                    fieldCode += `IntegerField(`;
                    break;
                case "DecimalField":
                    fieldCode += `DecimalField(max_digits=${field.maxDigits || 10}, decimal_places=${field.decimalPlaces || 2}`;
                    break;
                case "BooleanField":
                    fieldCode += `BooleanField(`;
                    break;
                case "DateField":
                    fieldCode += `DateField(`;
                    break;
                case "DateTimeField":
                    fieldCode += `DateTimeField(`;
                    if (field.autoNowAdd) {
                        fieldCode += `auto_now_add=True`;
                    }
                    break;
                case "ForeignKey":
                    fieldCode += `ForeignKey('${field.relatedModel || "auth.User"}', on_delete=models.${field.onDelete || "CASCADE"}`;
                    break;
                case "ManyToManyField":
                    fieldCode += `ManyToManyField('${field.relatedModel || "auth.User"}'`;
                    break;
                case "OneToOneField":
                    fieldCode += `OneToOneField('${field.relatedModel || "auth.User"}', on_delete=models.${field.onDelete || "CASCADE"}`;
                    break;
                case "FileField":
                    fieldCode += `FileField(upload_to='${field.uploadTo || "uploads/"}'`;
                    break;
                case "ImageField":
                    fieldCode += `ImageField(upload_to='${field.uploadTo || "images/"}'`;
                    break;
                case "EmailField":
                    fieldCode += `EmailField(max_length=${field.maxLength || 255}`;
                    break;
                case "URLField":
                    fieldCode += `URLField(max_length=${field.maxLength || 200}`;
                    break;
                default:
                    fieldCode += `CharField(max_length=255`;
            }
            if (field.required) {
                fieldCode += `, null=False, blank=False`;
            } else {
                fieldCode += `, null=True, blank=True`;
            }
            if (field.unique) {
                fieldCode += `, unique=True`;
            }
            if (field.choices && field.choices.length) {
                fieldCode += `, choices=[`;
                field.choices.forEach((choice, idx) => {
                    fieldCode += `('${choice.value}', '${choice.display}')`;
                    if (idx < field.choices.length - 1) fieldCode += `, `;
                });
                fieldCode += `]`;
            }
            if (field.default !== undefined && field.default !== null && field.type !== "DateTimeField") {
                if (["CharField", "TextField", "EmailField", "URLField"].includes(field.type)) {
                    fieldCode += `, default='${field.default}'`;
                } else if (field.type === "BooleanField") {
                    fieldCode += `, default=${field.default ? "True" : "False"}`;
                } else {
                    fieldCode += `, default=${field.default}`;
                }
            }
            fieldCode += `)\n`;
            code += fieldCode;
        });
        code += `\n    def __str__(self):\n`;
        const nameField = model.fields.find((f) => f.name === "name" || f.name === "title");
        if (nameField) {
            code += `        return self.${nameField.name}\n`;
        } else if (model.fields.length > 0) {
            code += `        return f"${model.name} {self.id}"\n`;
        } else {
            code += `        return f"${model.name} object {self.id}"\n`;
        }
        return code;
    };

    const generateSerializerCode = (model) => {
        let code = `from rest_framework import serializers\nfrom .models import ${model.name}\n\n`;
        code += `class ${model.name}Serializer(serializers.ModelSerializer):\n`;
        code += `    class Meta:\n`;
        code += `        model = ${model.name}\n`;
        code += `        fields = [\n`;
        code += `            'id',\n`;
        model.fields.forEach((field) => {
            code += `            '${field.name}',\n`;
        });
        code += `        ]\n`;
        return code;
    };

    const generateViewsCode = (model) => {
        let code = `from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView\n`;
        code += `from .models import ${model.name}\n`;
        code += `from .serializers import ${model.name}Serializer\n\n`;
        code += `# List and create ${model.name} instances\n`;
        code += `class ${model.name}ListCreateAPI(ListCreateAPIView):\n`;
        code += `    queryset = ${model.name}.objects.all()\n`;
        code += `    serializer_class = ${model.name}Serializer\n\n`;
        code += `    # Retrieve, update, or delete a ${model.name} instance\n`;
        code += `class ${model.name}DetailAPI(RetrieveUpdateDestroyAPIView):\n`;
        code += `    queryset = ${model.name}.objects.all()\n`;
        code += `    serializer_class = ${model.name}Serializer\n`;
        return code;
    };

    const generateUrlsCode = (model) => {
        let code = `from django.urls import path\n`;
        code += `from .views import ${model.name}ListCreateAPI, ${model.name}DetailAPI\n\n`;
        code += `urlpatterns = [\n`;
        code += `    path('${model.name.toLowerCase()}s/', ${model.name}ListCreateAPI.as_view(), name='${model.name.toLowerCase()}-list'),\n`;
        code += `    path('${model.name.toLowerCase()}s/<int:pk>/', ${model.name}DetailAPI.as_view(), name='${model.name.toLowerCase()}-detail'),\n`;
        code += `]\n`;
        return code;
    };

    const generateAllCode = () => {
        const model = models[activeModelIndex];
        if (!model || !model.name) return;
        const generatedCode = {
            model: generateModelCode(model),
            serializer: generateSerializerCode(model),
            views: generateViewsCode(model),
            urls: generateUrlsCode(model),
        };
        setGeneratedCode(generatedCode);
        setActiveTab("code");
        setCodeTab("model");
    };

    const activeModel = models[activeModelIndex];
    const djangoFieldTypes = [
        "CharField", "TextField", "IntegerField", "DecimalField", "BooleanField",
        "DateField", "DateTimeField", "ForeignKey", "ManyToManyField", "OneToOneField",
        "FileField", "ImageField", "EmailField", "URLField", "JSONField", "SlugField",
        "UUIDField", "AutoField",
    ];

    const getThemeClasses = () => {
        return theme === "black" ? "bg-black text-white" : "bg-white text-black";
    };

    return (
        <div className={`${getThemeClasses()} p-6 min-h-screen font-sans`}>
            <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Django Code Generator</h2>
                 
                </div>

                <div className={`flex border-b ${theme === "black" ? "border-white" : "border-black"} mb-6`}>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "model" ? `${theme === "black" ? "border-b-2 border-white text-white" : "border-b-2 border-black text-black"}` : `${theme === "black" ? "text-white/60" : "text-black/60"}`} transition-colors hover:${theme === "black" ? "text-white" : "text-black"}`}
                        onClick={() => setActiveTab("model")}
                    >
                        <Settings className="inline mr-1" size={16} /> Configuration
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium ${activeTab === "code" ? `${theme === "black" ? "border-b-2 border-white text-white" : "border-b-2 border-black text-black"}` : `${theme === "black" ? "text-white/60" : "text-black/60"} ${!generatedCode.model ? "opacity-50 cursor-not-allowed" : ""}`} transition-colors hover:${theme === "black" ? "text-white" : "text-black"}`}
                        onClick={() => setActiveTab("code")}
                        disabled={!generatedCode.model}
                    >
                        <Code className="inline mr-1" size={16} /> Generated Code
                    </button>
                </div>

                {activeTab === "model" && (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-lg border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"}`}>
                            <label className="block text-sm font-medium mb-2">App Name</label>
                            <input
                                type="text"
                                className={`w-full p-2 border rounded-md ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-2 focus:ring-${theme === "black" ? "white" : "black"}`}
                                value={appName}
                                onChange={(e) => setAppName(e.target.value.trim() || "myapp")}
                                placeholder="myapp"
                            />
                        </div>

                        <div className={`p-4 rounded-lg border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Models</h3>
                                <button
                                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${theme === "black" ? "bg-white text-black" : "bg-black text-white"}`}
                                    onClick={addModel}
                                >
                                    <Plus size={14} /> Add Model
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {models.map((model, idx) => (
                                    <div key={idx} className="flex items-center">
                                        <button
                                            className={`px-3 py-1 text-sm rounded-l ${activeModelIndex === idx ? `${theme === "black" ? "bg-white text-black" : "bg-black text-white"}` : `${theme === "black" ? "bg-black/50 text-white/60" : "bg-white/50 text-black/60"}`} transition-colors hover:${theme === "black" ? "bg-white/20 text-white" : "bg-black/20 text-black"}`}
                                            onClick={() => setActiveModelIndex(idx)}
                                        >
                                            {model.name}
                                        </button>
                                        {models.length > 1 && (
                                            <button
                                                className={`px-2 py-1 rounded-r border-l ${theme === "black" ? "bg-black/50 text-white/60 border-white/20" : "bg-white/50 text-black/60 border-black/20"} hover:${theme === "black" ? "bg-white/20 text-white" : "bg-black/20 text-black"}`}
                                                onClick={() => removeModel(idx)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Model Name</label>
                                    <input
                                        type="text"
                                        className={`w-full p-2 border rounded-md ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-2 focus:ring-${theme === "black" ? "white" : "black"}`}
                                        value={activeModel.name}
                                        onChange={(e) => updateModelName(activeModelIndex, e.target.value)}
                                        placeholder="ModelName"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-medium">Fields</label>
                                        <button
                                            className={`flex items-center gap-1 px-2 py-1 text-sm rounded ${theme === "black" ? "bg-white text-black" : "bg-black text-white"}`}
                                            onClick={() => addField(activeModelIndex)}
                                        >
                                            <Plus size={12} /> Add Field
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {activeModel.fields.map((field, idx) => (
                                            <div key={idx} className={`flex gap-2 items-center p-2 rounded border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"}`}>
                                                <input
                                                    type="text"
                                                    className={`flex-1 p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                                    value={field.name}
                                                    onChange={(e) => updateField(activeModelIndex, idx, "name", e.target.value.trim())}
                                                    placeholder="field_name"
                                                />
                                                <select
                                                    className={`p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                                    value={field.type}
                                                    onChange={(e) => updateField(activeModelIndex, idx, "type", e.target.value)}
                                                >
                                                    {djangoFieldTypes.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                                <label className="flex items-center gap-1 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(activeModelIndex, idx, "required", e.target.checked)}
                                                        className="rounded"
                                                    />
                                                    <span>Required</span>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    {["CharField", "EmailField", "URLField"].includes(field.type) ? (
                                                        <div className="flex items-center">
                                                            <span className="text-xs mr-1">max_length:</span>
                                                            <input
                                                                type="number"
                                                                className={`w-16 p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                                                value={field.maxLength || 255}
                                                                onChange={(e) => updateField(activeModelIndex, idx, "maxLength", parseInt(e.target.value) || 255)}
                                                            />
                                                        </div>
                                                    ) : field.type === "DecimalField" ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center">
                                                                <span className="text-xs mr-1">max_digits:</span>
                                                                <input
                                                                    type="number"
                                                                    className={`w-16 p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                                                    value={field.maxDigits || 10}
                                                                    onChange={(e) => updateField(activeModelIndex, idx, "maxDigits", parseInt(e.target.value) || 10)}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="text-xs mr-1">decimal_places:</span>
                                                                <input
                                                                    type="number"
                                                                    className={`w-16 p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                                                    value={field.decimalPlaces || 2}
                                                                    onChange={(e) => updateField(activeModelIndex, idx, "decimalPlaces", parseInt(e.target.value) || 2)}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : field.type === "DateTimeField" ? (
                                                        <label className="flex items-center gap-1 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.autoNowAdd || false}
                                                                onChange={(e) => updateField(activeModelIndex, idx, "autoNowAdd", e.target.checked)}
                                                                className="rounded"
                                                            />
                                                            <span>auto_now_add</span>
                                                        </label>
                                                    ) : ["ForeignKey", "OneToOneField"].includes(field.type) ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center">
                                                                <span className="text-xs mr-1">model:</span>
                                                                <input
                                                                    type="text"
                                                                    className={`w-24 p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                                                    value={field.relatedModel || "auth.User"}
                                                                    onChange={(e) => updateField(activeModelIndex, idx, "relatedModel", e.target.value.trim() || "auth.User")}
                                                                />
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="text-xs mr-1">on_delete:</span>
                                                                <select
                                                                    className={`p-1 border rounded text-sm ${theme === "black" ? "bg-black/50 border-white/20 text-white" : "bg-white/50 border-black/20 text-black"} focus:outline-none focus:ring-1 focus:ring-${theme === "black" ? "white" : "black"}`}
                                                                    value={field.onDelete || "CASCADE"}
                                                                    onChange={(e) => updateField(activeModelIndex, idx, "onDelete", e.target.value)}
                                                                >
                                                                    <option value="CASCADE">CASCADE</option>
                                                                    <option value="PROTECT">PROTECT</option>
                                                                    <option value="SET_NULL">SET_NULL</option>
                                                                    <option value="SET_DEFAULT">SET_DEFAULT</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-black/60">No options</span>
                                                    )}
                                                </div>
                                                <button
                                                    className={`p-1 rounded ${theme === "black" ? "text-white/60 hover:bg-white/20 hover:text-white" : "text-black/60 hover:bg-black/20 hover:text-black"}`}
                                                    onClick={() => removeField(activeModelIndex, idx)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    className={`w-full p-3 rounded-md text-sm font-medium ${theme === "black" ? "bg-white text-black" : "bg-black text-white"} disabled:opacity-50`}
                                    onClick={generateAllCode}
                                    disabled={!activeModel.name || activeModel.fields.some((f) => !f.name)}
                                >
                                    <Code className="inline mr-1" size={16} /> Generate Code
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "code" && generatedCode.model && (
                    <div className="space-y-4">
                        <div className={`flex border-b ${theme === "black" ? "border-white" : "border-black"}`}>
                            {["model", "serializer", "views", "urls"].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-2 text-sm font-medium ${codeTab === tab ? `${theme === "black" ? "border-b-2 border-white text-white" : "border-b-2 border-black text-black"}` : `${theme === "black" ? "text-white/60" : "text-black/60"}`} transition-colors hover:${theme === "black" ? "text-white" : "text-black"}`}
                                    onClick={() => setCodeTab(tab)}
                                >
                                    {tab === "model" ? "models.py" : tab === "serializer" ? "serializers.py" : tab === "views" ? "views.py" : "urls.py"}
                                </button>
                            ))}
                        </div>
                        <div className={`p-4 rounded-lg border ${theme === "black" ? "border-white/20 bg-black/80" : "border-black/20 bg-white/80"} max-h-96 overflow-auto`}>
                            <pre className="text-sm"><code>{generatedCode[codeTab]}</code></pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DjangoCodeGenerator;