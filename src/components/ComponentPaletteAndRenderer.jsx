"use client"

import React, { useState, useEffect } from "react"

// Enhanced ComponentPaletteAndRenderer Component
function ComponentPaletteAndRenderer({ onAddComponent, selectedColumnId }) {
    const components = [
        { type: "button", label: "Button" },
        { type: "input", label: "Input" },
        { type: "text", label: "Text" },
        { type: "image", label: "Image" },
        { type: "div", label: "Div" },
        { type: "card", label: "Card" },
        { type: "select", label: "Select" },
        { type: "modal", label: "Modal" },
    ]

    const renderComponent = (component) => {
        const { type, props = {} } = component

        switch (type) {
            case "button":
                return (
                    <button className={`px-4 py-2 rounded-md ${getButtonVariantClass(props.variant)} ${props.className || ""}`}>
                        {props.text || "Button"}
                    </button>
                )
            case "input":
                return (
                    <input
                        type={props.type || "text"}
                        placeholder={props.placeholder || "Enter text..."}
                        className={`px-3 py-2 border border-gray-300 rounded-md ${props.className || ""}`}
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
                        className={`${props.className || ""}`}
                        style={{
                            width: props.width || "100%",
                            height: props.height || "auto",
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
                            border: props.border || "none",
                            minHeight: "50px",
                        }}
                    >
                        {props.text || "Div Container"}
                    </div>
                )
            case "card":
                return (
                    <div className={`rounded-lg border border-gray-200 shadow-md overflow-hidden ${props.className || ""}`}>
                        {props.imagePosition !== "bottom" && props.showImage && (
                            <div className="h-48 w-full bg-gray-200 relative">
                                <img
                                    src={props.imageSrc || "https://via.placeholder.com/400x200"}
                                    alt={props.imageAlt || "Card image"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="p-4">
                            <h3 className={`text-lg font-semibold mb-2 ${props.titleClassName || ""}`}>
                                {props.title || "Card Title"}
                            </h3>
                            <p className={`text-gray-600 ${props.textClassName || ""}`}>
                                {props.text || "Card content goes here. Add description text to provide details."}
                            </p>
                            {props.showButton && (
                                <button className={`mt-4 px-4 py-2 rounded-md ${getButtonVariantClass(props.buttonVariant)}`}>
                                    {props.buttonText || "Read More"}
                                </button>
                            )}
                        </div>
                        {props.imagePosition === "bottom" && props.showImage && (
                            <div className="h-48 w-full bg-gray-200 relative">
                                <img
                                    src={props.imageSrc || "https://via.placeholder.com/400x200"}
                                    alt={props.imageAlt || "Card image"}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>
                )
            case "select":
                return (
                    <div className="relative">
                        <select
                            className={`appearance-none w-full px-3 py-2 border border-gray-300 rounded-md bg-white ${props.className || ""}`}
                            defaultValue={props.defaultValue || ""}
                        >
                            <option value="" disabled={props.required}>
                                {props.placeholder || "Select an option"}
                            </option>
                            {(props.options || [
                                { value: "option1", label: "Option 1" },
                                { value: "option2", label: "Option 2" },
                                { value: "option3", label: "Option 3" },
                            ]).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                )
            case "modal":
                return (
                    <div className={`fixed inset-0 z-50 flex items-center justify-center ${props.isOpen ? "block" : "hidden"}`}>
                        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                        <div className="bg-white rounded-lg shadow-xl z-10 w-11/12 md:w-3/4 lg:w-1/2 max-h-screen overflow-y-auto">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="text-lg font-semibold">{props.title || "Modal Title"}</h3>
                                <button className="text-gray-500 hover:text-gray-700" onClick={props.onClose}>
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-4">
                                <p>{props.content || "Modal content goes here"}</p>
                            </div>
                            <div className="flex justify-end p-4 border-t">
                                <button
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"
                                    onClick={props.onCancel}
                                >
                                    {props.cancelText || "Cancel"}
                                </button>
                                <button
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                    onClick={props.onConfirm}
                                >
                                    {props.confirmText || "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            default:
                return <div>Unknown component type: {type}</div>
        }
    }

    const getButtonVariantClass = (variant) => {
        switch (variant) {
            case "default":
                return "bg-blue-500 text-white hover:bg-blue-600"
            case "destructive":
                return "bg-red-500 text-white hover:bg-red-600"
            case "outline":
                return "border border-gray-300 bg-transparent hover:bg-gray-50"
            case "secondary":
                return "bg-gray-200 text-gray-800 hover:bg-gray-300"
            case "ghost":
                return "bg-transparent hover:bg-gray-100"
            case "success":
                return "bg-green-500 text-white hover:bg-green-600"
            case "warning":
                return "bg-yellow-500 text-white hover:bg-yellow-600"
            default:
                return "bg-blue-500 text-white hover:bg-blue-600"
        }
    }

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Components</h2>

            {selectedColumnId ? (
                <div className="mb-4">
                    <span className="inline-block px-2 py-1 text-xs border border-gray-200 rounded mb-2">
                        Adding to column: {selectedColumnId}
                    </span>
                </div>
            ) : (
                <p className="text-xs text-gray-500 mb-4">
                    Select a column first or components will be added to the first column
                </p>
            )}

            <div className="grid grid-cols-2 gap-2">
                {components.map((component) => (
                    <div
                        key={component.type}
                        className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 hover:border-blue-300"
                        onClick={() => onAddComponent(component.type)}
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("componentType", component.type)
                        }}
                    >
                        <div className="flex items-center justify-center h-10 mb-1">
                            {component.type === "button" ? (
                                <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Button</button>
                            ) : component.type === "input" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
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
                            ) : component.type === "text" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                            ) : component.type === "image" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
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
                            ) : component.type === "card" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                </svg>
                            ) : component.type === "select" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                    />
                                </svg>
                            ) : component.type === "modal" ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
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
                            )}
                        </div>
                        <span className="text-xs text-center">{component.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Enhanced PropertyEditor component for editing component properties
function PropertyEditor({ selectedComponent, selectedColumn, onUpdateComponent, onUpdateColumn }) {
    const [componentProps, setComponentProps] = useState({})
    const [columnProps, setColumnProps] = useState({})
    const [options, setOptions] = useState([
        { id: '1', value: 'option1', label: 'Option 1' },
        { id: '2', value: 'option2', label: 'Option 2' },
        { id: '3', value: 'option3', label: 'Option 3' }
    ])
    const [newOption, setNewOption] = useState({ value: '', label: '' })

    useEffect(() => {
        if (selectedComponent) {
            setComponentProps(selectedComponent.props || {})
        } else {
            setComponentProps({})
        }
    }, [selectedComponent])

    useEffect(() => {
        if (selectedColumn) {
            setColumnProps({
                backgroundColor: selectedColumn.backgroundColor || "#ffffff",
                borderRadius: selectedColumn.borderRadius || "0",
                border: selectedColumn.border || "none",
                padding: selectedColumn.padding || "0",
            })
        } else {
            setColumnProps({})
        }
    }, [selectedColumn])

    const handleComponentPropChange = (propName, value) => {
        const updatedProps = { ...componentProps, [propName]: value }
        setComponentProps(updatedProps)
        onUpdateComponent(selectedComponent.id, updatedProps)
    }

    const handleColumnPropChange = (propName, value) => {
        const updatedProps = { ...columnProps, [propName]: value }
        setColumnProps(updatedProps)
        onUpdateColumn(selectedColumn.id, updatedProps)
    }

    const addOption = () => {
        if (newOption.value && newOption.label) {
            const updatedOptions = [...options, { id: Date.now().toString(), ...newOption }]
            setOptions(updatedOptions)
            handleComponentPropChange('options', updatedOptions)
            setNewOption({ value: '', label: '' })
        }
    }

    const removeOption = (id) => {
        const updatedOptions = options.filter(option => option.id !== id)
        setOptions(updatedOptions)
        handleComponentPropChange('options', updatedOptions)
    }

    // Render properties for the selected component
    const renderComponentProperties = () => {
        if (!selectedComponent) return null

        const { type } = selectedComponent

        switch (type) {
            case "button":
                return (
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Button Text</label>
                            <input
                                type="text"
                                value={componentProps.text || ""}
                                onChange={(e) => handleComponentPropChange("text", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Variant</label>
                            <select
                                value={componentProps.variant || "default"}
                                onChange={(e) => handleComponentPropChange("variant", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="default">Default</option>
                                <option value="destructive">Destructive</option>
                                <option value="outline">Outline</option>
                                <option value="secondary">Secondary</option>
                                <option value="ghost">Ghost</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Width</label>
                            <select
                                value={componentProps.width || "auto"}
                                onChange={(e) => handleComponentPropChange("width", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="auto">Auto</option>
                                <option value="full">Full Width</option>
                                <option value="3/4">75%</option>
                                <option value="1/2">50%</option>
                                <option value="1/4">25%</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Alignment</label>
                            <div className="flex border border-gray-300 rounded-md">
                                <button
                                    className={`flex-1 py-2 ${componentProps.align === "left" ? "bg-blue-100 text-blue-700" : ""}`}
                                    onClick={() => handleComponentPropChange("align", "left")}
                                >
                                    Left
                                </button>
                                <button
                                    className={`flex-1 py-2 ${componentProps.align === "center" ? "bg-blue-100 text-blue-700" : ""}`}
                                    onClick={() => handleComponentPropChange("align", "center")}
                                >
                                    Center
                                </button>
                                <button
                                    className={`flex-1 py-2 ${componentProps.align === "right" ? "bg-blue-100 text-blue-700" : ""}`}
                                    onClick={() => handleComponentPropChange("align", "right")}
                                >
                                    Right
                                </button>
                            </div>
                        </div>
                    </div>
                )
            case "input":
                return (
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Placeholder</label>
                            <input
                                type="text"
                                value={componentProps.placeholder || ""}
                                onChange={(e) => handleComponentPropChange("placeholder", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Input Type</label>
                            <select
                                value={componentProps.type || "text"}
                                onChange={(e) => handleComponentPropChange("type", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="password">Password</option>
                                <option value="number">Number</option>
                                <option value="tel">Telephone</option>
                                <option value="date">Date</option>
                                <option value="time">Time</option>
                                <option value="datetime-local">Date & Time</option>
                                <option value="url">URL</option>
                                <option value="search">Search</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Label</label>
                            <input
                                type="text"
                                value={componentProps.label || ""}
                                onChange={(e) => handleComponentPropChange("label", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4 flex items-center">
                            <input
                                type="checkbox"
                                id="required"
                                checked={componentProps.required || false}
                                onChange={(e) => handleComponentPropChange("required", e.target.checked)}
                                className="mr-2"
                            />
                            <label htmlFor="required" className="text-sm font-medium">Required</label>
                        </div>
                    </div>
                )
            case "text":
                return (
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Text Content</label>
                            <textarea
                                value={componentProps.text || ""}
                                onChange={(e) => handleComponentPropChange("text", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows="4"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Element Type</label>
                            <select
                                value={componentProps.element || "p"}
                                onChange={(e) => handleComponentPropChange("element", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="p">Paragraph</option>
                                <option value="h1">Heading 1</option>
                                <option value="h2">Heading 2</option>
                                <option value="h3">Heading 3</option>
                                <option value="h4">Heading 4</option>
                                <option value="h5">Heading 5</option>
                                <option value="h6">Heading 6</option>
                                <option value="span">Span</option>
                                <option value="div">Div</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Font Weight</label>
                            <select
                                value={componentProps.fontWeight || "normal"}
                                onChange={(e) => handleComponentPropChange("fontWeight", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="normal">Normal</option>
                                <option value="medium">Medium</option>
                                <option value="semibold">Semibold</option>
                                <option value="bold">Bold</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Text Align</label>
                            <select
                                value={componentProps.textAlign || "left"}
                                onChange={(e) => handleComponentPropChange("textAlign", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                                <option value="justify">Justify</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Font Size</label>
                            <input
                                type="text"
                                value={componentProps.fontSize || ""}
                                onChange={(e) => handleComponentPropChange("fontSize", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g. 1rem, 16px"
                            />
                        </div>
                    </div>
                )
            case "image":
                return (
                    <div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Image Source</label>
                            <input
                                type="text"
                                value={componentProps.src || ""}
                                onChange={(e) => handleComponentPropChange("src", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Alt Text</label>
                            <input
                                type="text"
                                value={componentProps.alt || ""}
                                onChange={(e) => handleComponentPropChange("alt", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Width</label>
                            <input
                                type="text"
                                value={componentProps.width || ""}
                                onChange={(e) => handleComponentPropChange("width", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g. 100%, 300px"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Height</label>
                            <input
                                type="text"
                                value={componentProps.height || ""}
                                onChange={(e) => handleComponentPropChange("height", e.target.value)}
                                placeholder="e.g. auto, 200px"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Additional Classes</label>
                            <input
                                type="text"
                                value={componentProps.className || ""}
                                onChange={(e) => handleComponentPropChange("className", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                );

            case "div":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Background Color</label>
                            <div className="flex items-center">
                                <input
                                    type="color"
                                    value={componentProps.backgroundColor || "#ffffff"}
                                    onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                                    className="h-10 w-10 rounded border border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={componentProps.backgroundColor || ""}
                                    onChange={(e) => handlePropChange("backgroundColor", e.target.value)}
                                    placeholder="e.g. #ffffff, red"
                                    className="ml-2 flex-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Padding</label>
                            <input
                                type="text"
                                value={componentProps.padding || ""}
                                onChange={(e) => handlePropChange("padding", e.target.value)}
                                placeholder="e.g. 1rem, 16px"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Border Radius</label>
                            <input
                                type="text"
                                value={componentProps.borderRadius || ""}
                                onChange={(e) => handlePropChange("borderRadius", e.target.value)}
                                placeholder="e.g. 0.25rem, 4px"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Content</label>
                            <textarea
                                value={componentProps.text || ""}
                                onChange={(e) => handlePropChange("text", e.target.value)}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Additional Classes</label>
                            <input
                                type="text"
                                value={componentProps.className || ""}
                                onChange={(e) => handlePropChange("className", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                    </div>
                )
            default:
                return (
                    <div className="text-center py-4">
                        <p className="text-gray-500">No configuration options available for this component.</p>
                    </div>
                )
        }
    }

    return (
        <div className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 z-10">
                <h2 className="text-lg font-semibold mb-2">Components</h2>

                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Search components..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg
                        className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {selectedColumnId ? (
                    <div className="mb-4">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded mb-2">
                            Adding to column: {selectedColumnId}
                        </span>
                    </div>
                ) : (
                    <p className="text-xs text-gray-500 mb-4">
                        Select a column first or components will be added to the first column
                    </p>
                )}
            </div>

            {componentCategories.map((category) => (
                <div key={category.name} className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {category.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {category.components
                            .filter(comp => comp.label.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((component) => (
                                <div
                                    key={component.type}
                                    className="flex flex-col items-center justify-center p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleComponentClick(component)}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData("componentType", component.type)
                                    }}
                                >
                                    <div className="flex items-center justify-center h-10 mb-1">
                                        {getComponentIcon(component.type)}
                                    </div>
                                    <span className="text-xs text-center">{component.label}</span>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            {/* Component Configuration Modal */}
            <Transition appear show={isModalOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={React.Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Configure {selectedComponent?.label}
                                    </Dialog.Title>

                                    <div className="mt-4 mb-6 p-4 border border-gray-200 rounded-lg">
                                        <p className="text-sm font-medium text-gray-500 mb-2">Preview:</p>
                                        <div className="flex justify-center">
                                            {selectedComponent && renderComponentPreview(selectedComponent)}
                                        </div>
                                    </div>

                                    <div className="mt-2 max-h-[400px] overflow-y-auto">
                                        {selectedComponent && renderComponentForm()}
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={handleAddWithProps}
                                        >
                                            Add Component
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}

function getComponentIcon(type) {
    switch (type) {
        case "button":
            return (
                <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded">Btn</button>
            )
        case "input":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            )
        case "image":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
                    className="h-6 w-6"
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
        case "card":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            )
        case "section":
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                </svg>
            )
        default:
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            )
    }
}

export default ComponentPaletteAndRenderer