"use client"

import { useState } from "react"

function PropertiesAndCodePanel({ component, columnId, column, onUpdateComponent, onUpdateColumn, code }) {
    const [activeTab, setActiveTab] = useState("component")

    if (!columnId) {
        return (
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold mb-2">Properties</h2>
                <p className="text-gray-500 text-sm">Select a component or column to edit its properties</p>
            </div>
        )
    }

    const handlePropChange = (propName, value) => {
        if (component && columnId) {
            onUpdateComponent(component.id, columnId, { [propName]: value })
        }
    }

    const handleColumnChange = (propName, value) => {
        if (columnId) {
            onUpdateColumn(columnId, { [propName]: value })
        }
    }

    const renderColumnProperties = () => {
        if (!column) return null

        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Flex Direction</label>
                    <select
                        value={column.orientation || "horizontal"}
                        onChange={(e) => handleColumnChange("orientation", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="horizontal">Row</option>
                        <option value="vertical">Column</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                    <select
                        value={column.flexLayout || "items-start justify-start"}
                        onChange={(e) => handleColumnChange("flexLayout", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="items-start justify-start">Top Left</option>
                        <option value="items-start justify-center">Top Center</option>
                        <option value="items-start justify-end">Top Right</option>
                        <option value="items-center justify-start">Center Left</option>
                        <option value="items-center justify-center">Center</option>
                        <option value="items-center justify-end">Center Right</option>
                        <option value="items-end justify-start">Bottom Left</option>
                        <option value="items-end justify-center">Bottom Center</option>
                        <option value="items-end justify-end">Bottom Right</option>
                        <option value="items-center justify-between">Space Between</option>
                        <option value="items-center justify-around">Space Around</option>
                        <option value="items-center justify-evenly">Space Evenly</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gap (rem)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={column.gap || "0"}
                        onChange={(e) => handleColumnChange("gap", e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter gap size in rem (e.g., 0.5, 1, 1.5)</p>
                </div>
            </div>
        )
    }

    const renderCommonProperties = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CSS Class</label>
                <input
                    value={component?.props.className || ""}
                    onChange={(e) => handlePropChange("className", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            </div>
        </div>
    )

    const renderSpecificProperties = () => {
        if (!component) return null

        switch (component.type) {
            case "button":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                            <input
                                value={component.props.text || "Button"}
                                onChange={(e) => handlePropChange("text", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
                            <select
                                value={component.props.variant || "default"}
                                onChange={(e) => handlePropChange("variant", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="default">Default</option>
                                <option value="destructive">Destructive</option>
                                <option value="outline">Outline</option>
                                <option value="secondary">Secondary</option>
                                <option value="ghost">Ghost</option>
                                <option value="link">Link</option>
                            </select>
                        </div>
                    </div>
                )
            case "input":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                            <input
                                value={component.props.placeholder || "Enter text..."}
                                onChange={(e) => handlePropChange("placeholder", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
                            <select
                                value={component.props.type || "text"}
                                onChange={(e) => handlePropChange("type", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="text">Text</option>
                                <option value="password">Password</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="tel">Telephone</option>
                            </select>
                        </div>
                    </div>
                )
            case "text":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Element Type</label>
                            <select
                                value={component.props.element || "p"}
                                onChange={(e) => handlePropChange("element", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="p">Paragraph</option>
                                <option value="h1">Heading 1</option>
                                <option value="h2">Heading 2</option>
                                <option value="h3">Heading 3</option>
                                <option value="h4">Heading 4</option>
                                <option value="h5">Heading 5</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
                            <input
                                value={component.props.text || "Text content"}
                                onChange={(e) => handlePropChange("text", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
                            <select
                                value={component.props.fontWeight || "normal"}
                                onChange={(e) => handlePropChange("fontWeight", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="normal">Normal</option>
                                <option value="medium">Medium</option>
                                <option value="semibold">Semibold</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Alignment</label>
                            <select
                                value={component.props.textAlign || "left"}
                                onChange={(e) => handlePropChange("textAlign", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                )
            case "image":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image Source</label>
                            <input
                                value={component.props.src || "https://via.placeholder.com/300x200"}
                                onChange={(e) => handlePropChange("src", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                            <input
                                value={component.props.alt || "Image"}
                                onChange={(e) => handlePropChange("alt", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                            <input
                                value={component.props.width || "100%"}
                                onChange={(e) => handlePropChange("width", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                            <input
                                value={component.props.height || "auto"}
                                onChange={(e) => handlePropChange("height", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                )
            case "div":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <input
                                value={component.props.text || "Div Container"}
                                onChange={(e) => handlePropChange("text", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                            <input
                                type="color"
                                value={component.props.backgroundColor || "#ffffff"}
                                onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                            <input
                                value={component.props.padding || "1rem"}
                                onChange={(e) => handlePropChange("padding", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                            <input
                                value={component.props.borderRadius || "0.25rem"}
                                onChange={(e) => handlePropChange("borderRadius", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                )
            default:
                return <div>No specific properties available for this component type.</div>
        }
    }

    return (
        <div className="w-80 border-l border-gray-200 overflow-y-auto">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 overflow-y-auto">
                    <h2 className="text-lg font-semibold mb-4">Properties</h2>

                    <div className="mb-4">
                        <div className="flex border-b">
                            <button
                                className={`px-4 py-2 ${activeTab === "component" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
                                    }`}
                                onClick={() => setActiveTab("component")}
                                disabled={!component}
                            >
                                Component
                            </button>
                            <button
                                className={`px-4 py-2 ${activeTab === "column" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
                                    }`}
                                onClick={() => setActiveTab("column")}
                            >
                                Column
                            </button>
                        </div>
                    </div>

                    {activeTab === "component" && component ? (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-500 mb-4">
                                Component Type: <span className="font-medium">{component.type}</span>
                            </div>

                            <div className="mb-4">
                                <div className="flex border-b">
                                    <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-500" onClick={() => { }}>
                                        Properties
                                    </button>
                                </div>
                            </div>

                            {renderSpecificProperties()}
                            <hr className="my-4" />
                            {renderCommonProperties()}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-gray-500 mb-4">
                                Column ID: <span className="font-medium">{columnId}</span>
                            </div>
                            <hr className="my-4" />
                            {renderColumnProperties()}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 p-4 flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Generated Code</h2>
                        <div className="flex space-x-2">
                            <button
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                                onClick={() => {
                                    navigator.clipboard.writeText(code)
                                    alert("Code copied to clipboard!")
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    />
                                </svg>
                                Copy
                            </button>
                        </div>
                    </div>

                    <pre className="bg-gray-50 p-4 rounded-md overflow-auto h-full text-sm">
                        <code>{code}</code>
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default PropertiesAndCodePanel
