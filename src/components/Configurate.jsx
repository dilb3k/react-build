"use client";

import React from "react";

export const ModelConfiguration = ({
    mongoUrl,
    setMongoUrl,
    port,
    setPort,
    models,
    activeModelIndex,
    setActiveModelIndex,
    activeModel,
    addModel,
    removeModel,
    updateModelName,
    addField,
    updateField,
    removeField,
    generateCode,
    dataTypes,
    darkMode
}) => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                        MongoDB Connection URL
                    </label>
                    <input
                        type="text"
                        value={mongoUrl}
                        onChange={(e) => setMongoUrl(e.target.value)}
                        className={`block w-full p-2 rounded border ${darkMode
                            ? "bg-gray-700 border-gray-600 focus:border-white"
                            : "border-gray-300 focus:border-black"
                            } focus:ring-1 ${darkMode ? "focus:ring-white" : "focus:ring-black"}`}
                        placeholder="mongodb://localhost:27017/myDatabase"
                    />
                </div>
                <div>
                    <label
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                        Server Port
                    </label>
                    <input
                        type="text"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        className={`block w-full p-2 rounded border ${darkMode
                            ? "bg-gray-700 border-gray-600 focus:border-white"
                            : "border-gray-300 focus:border-black"
                            } focus:ring-1 ${darkMode ? "focus:ring-white" : "focus:ring-black"}`}
                        placeholder="5070"
                    />
                </div>
            </div>

            <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    {models.map((model, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveModelIndex(index)}
                            className={`px-3 py-1 rounded-t-md ${activeModelIndex === index
                                ? darkMode
                                    ? "bg-gray-700"
                                    : "bg-gray-200"
                                : darkMode
                                    ? "bg-gray-600 hover:bg-gray-700"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                        >
                            {model.name}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeModel(index);
                                }}
                                className="ml-2 text-xs"
                                disabled={models.length <= 1}
                            >
                                ×
                            </button>
                        </button>
                    ))}
                    <button
                        onClick={addModel}
                        className={`px-3 py-1 rounded-md ${darkMode ? "bg-gray-600 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}
                    >
                        + Add Model
                    </button>
                </div>

                <div
                    className={`p-4 rounded-b-md rounded-r-md ${darkMode ? "bg-gray-700" : "bg-gray-50"} border ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                >
                    <div className="mb-4">
                        <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                            Model Name (singular)
                        </label>
                        <input
                            type="text"
                            value={activeModel.name}
                            onChange={(e) => updateModelName(activeModelIndex, e.target.value)}
                            className={`block w-full p-2 rounded border ${darkMode
                                ? "bg-gray-600 border-gray-500 focus:border-white"
                                : "border-gray-300 focus:border-black"
                                } focus:ring-1 ${darkMode ? "focus:ring-white" : "focus:ring-black"}`}
                            placeholder="e.g., user, product, post"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label
                                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                            >
                                Schema Fields
                            </label>
                            <button
                                onClick={() => addField(activeModelIndex)}
                                className={`px-3 py-1 ${darkMode ? "bg-gray-600 hover:bg-gray-500" : "bg-gray-200 hover:bg-gray-300"} text-sm rounded`}
                            >
                                + Add Field
                            </button>
                        </div>

                        <div
                            className={`grid grid-cols-12 gap-2 mb-1 text-sm font-medium px-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                            <div className="col-span-5">Field Name</div>
                            <div className="col-span-4">Data Type</div>
                            <div className="col-span-2">Required</div>
                            <div className="col-span-1"></div>
                        </div>

                        <div className="space-y-2 mb-4">
                            {activeModel.fields.map((field, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5">
                                        <input
                                            type="text"
                                            value={field.name}
                                            onChange={(e) =>
                                                updateField(activeModelIndex, index, "name", e.target.value)
                                            }
                                            placeholder="Field name"
                                            className={`w-full p-2 rounded border ${darkMode
                                                ? "bg-gray-600 border-gray-500 focus:border-white"
                                                : "border-gray-300 focus:border-black"
                                                } focus:ring-1 ${darkMode ? "focus:ring-white" : "focus:ring-black"}`}
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <select
                                            value={field.type}
                                            onChange={(e) =>
                                                updateField(activeModelIndex, index, "type", e.target.value)
                                            }
                                            className={`w-full p-2 rounded border ${darkMode
                                                ? "bg-gray-600 border-gray-500 focus:border-white"
                                                : "border-gray-300 focus:border-black"
                                                } focus:ring-1 ${darkMode ? "focus:ring-white" : "focus:ring-black"}`}
                                        >
                                            {dataTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-span-2 flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) =>
                                                updateField(activeModelIndex, index, "required", e.target.checked)
                                            }
                                            className={`mr-2 h-4 w-4 ${darkMode ? "border-gray-500 bg-gray-600" : "border-gray-300"} rounded ${darkMode ? "focus:ring-white" : "focus:ring-black"}`}
                                        />
                                        <span className="text-sm">Required</span>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button
                                            onClick={() => removeField(activeModelIndex, index)}
                                            className={`${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-600"}`}
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
                    disabled={
                        !mongoUrl ||
                        models.some((model) => !model.name || model.fields.some((f) => !f.name))
                    }
                    className={`px-6 py-3 rounded-md font-medium ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-black hover:bg-gray-800"} text-white ${!mongoUrl ||
                        models.some((model) => !model.name || model.fields.some((f) => !f.name))
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                        }`}
                >
                    Generate API Code
                </button>
            </div>
        </>
    );
};