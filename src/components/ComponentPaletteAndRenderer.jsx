"use client"

import React from "react"

function ComponentPaletteAndRenderer({ onAddComponent, selectedColumnId }) {
    const components = [
        { type: "button", label: "Button", icon: "button" },
        { type: "input", label: "Input", icon: "input" },
        { type: "text", label: "Text", icon: "text" },
        { type: "image", label: "Image", icon: "image" },
        { type: "div", label: "Div", icon: "div" },
    ]

    const renderComponent = (component) => {
        const { type, props = {} } = component

        switch (type) {
            case "button":
                return (
                    <button className={`px-4 py-2 rounded-md transition-colors ${getButtonVariantClass(props.variant)} ${props.className || ""}`}>
                        {props.text || "Button"}
                    </button>
                )
            case "input":
                return (
                    <input
                        type={props.type || "text"}
                        placeholder={props.placeholder || "Enter text..."}
                        className={`px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:outline-none ${props.className || ""}`}
                    />
                )
            case "text":
                const Element = props.element || "p"
                return React.createElement(
                    Element,
                    {
                        className: `${props.className || ""} font-${props.fontWeight || "normal"} text-${props.textAlign || "left"}`,
                        style: {
                            fontSize: props.fontSize || (Element === "p" ? "1rem" : undefined),
                        },
                    },
                    props.text || (Element === "p" ? "Paragraph text" : `${Element.toUpperCase()} Heading`),
                )
            case "image":
                return (
                    <img
                        src={props.src || "https://via.placeholder.com/300x200"}
                        alt={props.alt || "Image"}
                        className={`rounded-md ${props.className || ""}`}
                        style={{
                            width: props.width || "100%",
                            height: props.height || "auto",
                            objectFit: props.objectFit || "cover",
                        }}
                    />
                )
            case "div":
                return (
                    <div
                        className={`${props.className || ""}`}
                        style={{
                            backgroundColor: props.backgroundColor || "transparent",
                            padding: props.padding || "1rem",
                            borderRadius: props.borderRadius || "0.25rem",
                            border: props.border || "1px dashed #e5e7eb",
                            minHeight: "50px",
                        }}
                    >
                        {props.text || "Div Container"}
                    </div>
                )
            default:
                return <div>Unknown component type: {type}</div>
        }
    }

    const getButtonVariantClass = (variant) => {
        switch (variant) {
            case "default":
                return "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
            case "destructive":
                return "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
            case "outline":
                return "border border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100"
            case "secondary":
                return "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
            case "ghost":
                return "bg-transparent hover:bg-gray-100 active:bg-gray-200"
            default:
                return "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
        }
    }

    const ComponentIcon = ({ type }) => {
        switch (type) {
            case "button":
                return (
                    <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Button</button>
                )
            case "input":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                )
            case "text":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16m-7 6h7"
                        />
                    </svg>
                )
            case "image":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                )
            case "div":
                return (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                    </svg>
                )
            default:
                return <div className="h-6 w-6 bg-gray-200 rounded"></div>
        }
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto shadow-sm h-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Components</h2>

            {selectedColumnId ? (
                <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs border border-blue-200 rounded-full mb-2">
                        Column: {selectedColumnId}
                    </span>
                </div>
            ) : (
                <p className="text-xs text-gray-500 mb-4 italic">
                    Select a column first or components will be added to the first column
                </p>
            )}

            <div className="grid grid-cols-2 gap-3">
                {components.map((component) => (
                    <div
                        key={component.type}
                        className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm"
                        onClick={() => onAddComponent(component.type)}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("componentType", component.type)
                        }}
                    >
                        <div className="flex items-center justify-center h-10 mb-2">
                            <ComponentIcon type={component.type} />
                        </div>
                        <span className="text-xs font-medium text-center text-gray-700">{component.label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-3">
                    <p className="text-xs text-gray-500 mb-2">Selected component preview:</p>
                    <div className="min-h-10 flex items-center justify-center">
                        {/* Preview would go here based on selected component */}
                        <span className="text-xs text-gray-400">Select a component</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComponentPaletteAndRenderer