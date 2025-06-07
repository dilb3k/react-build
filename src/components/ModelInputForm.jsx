import React from "react";

const ModelInputForm = ({
    modelName,
    setModelName,
    fields,
    fieldTypes,
    addField,
    removeField,
    updateField,
    generateCode,
    darkMode,
}) => {
    return (
        <div className={`p-6 rounded-lg shadow-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
            <h2 className="text-2xl font-semibold mb-6">Model Configuration</h2>

            {/* Model Name */}
            <div className="mb-6">
                <label className="block mb-2 font-medium text-lg">Model Name</label>
                <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g., Product, User, Order"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
                        }`}
                />
            </div>

            {/* Fields */}
            <div className="mb-6">
                <label className="block mb-2 font-medium text-lg">Fields</label>
                {fields.map((field, index) => (
                    <div
                        key={index}
                        className={`flex flex-wrap gap-4 mb-4 p-4 border rounded-lg ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-white"
                            }`}
                    >
                        {/* Field Name */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm mb-1">Name</label>
                            <input
                                type="text"
                                value={field.name}
                                onChange={(e) => updateField(index, "name", e.target.value)}
                                placeholder="field_name"
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-800"
                                    }`}
                            />
                        </div>

                        {/* Field Type */}
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm mb-1">Type</label>
                            <select
                                value={field.type}
                                onChange={(e) => updateField(index, "type", e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-800"
                                    }`}
                            >
                                {fieldTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Required */}
                        <div className="w-20">
                            <label className="block text-sm mb-1">Required</label>
                            <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(index, "required", e.target.checked)}
                                className="w-5 h-5 mt-2"
                            />
                        </div>

                        {/* Max Length (for CharField) */}
                        {field.type === "CharField" && (
                            <div className="flex-1 min-w-[100px]">
                                <label className="block text-sm mb-1">Max Length</label>
                                <input
                                    type="number"
                                    value={field.maxLength}
                                    onChange={(e) => updateField(index, "maxLength", e.target.value)}
                                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-800"
                                        }`}
                                />
                            </div>
                        )}

                        {/* Choices */}
                        <div className="w-full">
                            <label className="block text-sm mb-1">Choices (comma-separated)</label>
                            <input
                                type="text"
                                value={field.choices}
                                onChange={(e) => updateField(index, "choices", e.target.value)}
                                placeholder="Option1, Option2, Option3"
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-800"
                                    }`}
                            />
                        </div>

                        {/* Default Value */}
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm mb-1">Default Value</label>
                            <input
                                type="text"
                                value={field.defaultValue}
                                onChange={(e) => updateField(index, "defaultValue", e.target.value)}
                                className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-800"
                                    }`}
                            />
                        </div>

                        {/* Remove Field Button */}
                        {fields.length > 1 && (
                            <div className="flex items-center w-full md:w-auto mt-2 md:mt-6">
                                <button
                                    onClick={() => removeField(index)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <button
                    onClick={addField}
                    className={`px-4 py-2 rounded-lg text-white font-semibold ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-500 hover:bg-blue-600"
                        } transition`}
                >
                    Add Field
                </button>
            </div>

            {/* Generate Button */}
            <button
                onClick={generateCode}
                disabled={!modelName || fields.some((f) => !f.name)}
                className={`px-6 py-3 rounded-lg text-white font-bold w-full ${!modelName || fields.some((f) => !f.name)
                        ? "bg-gray-500 cursor-not-allowed"
                        : darkMode
                            ? "bg-green-600 hover:bg-green-500"
                            : "bg-green-500 hover:bg-green-600"
                    } transition`}
            >
                Generate Django Code
            </button>
        </div>
    );
};

export default ModelInputForm;