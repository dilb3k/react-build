"use client"

import { useState, useCallback, useEffect } from "react"
import ComponentPaletteAndRenderer from "./ComponentPaletteAndRenderer"
import LayoutEditor from "./LayoutEditor"
import PropertiesAndCodePanel from "./PropertiesAndCodePanel"
import TemplatesManager from "./TemplatesManager"
import generateVueCode from "../utils/VueCodeGenerator";

import { generateReactCode } from "../utils/CodeGenerator"
import CodePanel from "./CodePanel"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, RotateCcw } from "lucide-react"

const STORAGE_KEY = "react-ui-builder-state"

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
}

function UIBuilder() {
    const [layout, setLayout] = useState(DEFAULT_LAYOUT)
    const [selectedComponentId, setSelectedComponentId] = useState(null)
    const [selectedColumnId, setSelectedColumnId] = useState(null)
    const [codeFormat, setCodeFormat] = useState("react")
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
    const [showPreview, setShowPreview] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)
    const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false)

    // Load saved state on initial render
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY)
            if (savedState) {
                const parsedState = JSON.parse(savedState)

                // Validate the loaded state before setting it
                if (parsedState && parsedState.layout && Array.isArray(parsedState.layout.columns)) {
                    // Ensure each column has the required properties
                    const validatedColumns = validateColumns(parsedState.layout.columns)

                    setLayout({
                        columns: validatedColumns,
                        containerWidth: parsedState.layout.containerWidth || DEFAULT_LAYOUT.containerWidth,
                    })
                } else {
                    console.warn("Invalid saved state format, using default layout")
                    setLayout(DEFAULT_LAYOUT)
                }
            }
        } catch (error) {
            console.error("Failed to load saved state:", error)
            setLayout(DEFAULT_LAYOUT)
        }
    }, [])

    // Validate columns recursively to ensure they have all required properties
    const validateColumns = (columns) => {
        return columns.map((column) => {
            // Ensure column has all required properties
            const validatedColumn = {
                id: column.id || `column-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                width: typeof column.width === "number" ? column.width : 12,
                components: Array.isArray(column.components) ? column.components : [],
                orientation: column.orientation === "vertical" ? "vertical" : "horizontal",
                parentId: column.parentId || null,
                childColumns: Array.isArray(column.childColumns) ? validateColumns(column.childColumns) : [],
                flexLayout: column.flexLayout || "items-start justify-start",
                gap: column.gap || "0",
            }

            return validatedColumn
        })
    }

    // Save state when layout changes
    useEffect(() => {
        try {
            const stateToSave = {
                layout,
                timestamp: new Date().toISOString(),
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave))
        } catch (error) {
            console.error("Failed to save state:", error)
        }
    }, [layout])

    const resetState = () => {
        if (window.confirm("Are you sure you want to reset the layout? This cannot be undone.")) {
            setLayout(DEFAULT_LAYOUT)
            setSelectedComponentId(null)
            setSelectedColumnId(null)
            localStorage.removeItem(STORAGE_KEY)
            alert("Layout has been reset to default.")
        }
    }

    const saveTemplate = (name, category, layout) => {
        try {
            // Get existing templates
            const savedTemplates = localStorage.getItem("ui-builder-templates")
            const templates = savedTemplates ? JSON.parse(savedTemplates) : []

            // Add new template
            const newTemplate = {
                id: `template-${Date.now()}`,
                name,
                category,
                layout,
                createdAt: new Date().toISOString(),
            }

            templates.push(newTemplate)

            // Save updated templates
            localStorage.setItem("ui-builder-templates", JSON.stringify(templates))
            alert(`Template "${name}" has been saved successfully.`)
        } catch (error) {
            console.error("Failed to save template:", error)
            alert("Failed to save your template. Please try again.")
        }
    }

    const getSelectedComponent = () => {
        if (!selectedComponentId) return { component: null, columnId: null }

        // Recursive function to find component in nested columns
        const findComponentInColumns = (columns) => {
            for (const column of columns) {
                if (!column) continue // Skip if column is undefined

                const component = column.components?.find((comp) => comp.id === selectedComponentId)
                if (component) {
                    return { component, columnId: column.id }
                }

                if (column.childColumns && column.childColumns.length > 0) {
                    const result = findComponentInColumns(column.childColumns)
                    if (result.component) {
                        return result
                    }
                }
            }
            return { component: null, columnId: null }
        }

        return findComponentInColumns(layout.columns || [])
    }

    const getSelectedColumn = () => {
        if (!selectedColumnId) return null

        // Recursive function to find column by ID
        const findColumn = (columns) => {
            for (const column of columns) {
                if (!column) continue

                if (column.id === selectedColumnId) {
                    return column
                }

                if (column.childColumns && column.childColumns.length > 0) {
                    const result = findColumn(column.childColumns)
                    if (result) {
                        return result
                    }
                }
            }
            return null
        }

        return findColumn(layout.columns || [])
    }

    const handleAddComponent = (componentType, columnId, defaultProps = {}) => {
        const newComponent = {
            id: `component-${Date.now()}`,
            type: componentType,
            props: {
                ...defaultProps,
            },
        }

        setLayout((prevLayout) => {
            // Recursive function to update nested columns
            const updateColumns = (columns) => {
                if (!columns) return []

                return columns.map((column) => {
                    if (!column) return column

                    if (column.id === columnId) {
                        return {
                            ...column,
                            components: [...(column.components || []), newComponent],
                        }
                    }

                    if (column.childColumns && column.childColumns.length > 0) {
                        return {
                            ...column,
                            childColumns: updateColumns(column.childColumns),
                        }
                    }

                    return column
                })
            }

            return {
                ...prevLayout,
                columns: updateColumns(prevLayout.columns || []),
            }
        })

        setSelectedComponentId(newComponent.id)
    }

    const handleUpdateComponent = (componentId, columnId, updatedProps) => {
        setLayout((prevLayout) => {
            // Recursive function to update nested columns
            const updateColumns = (columns) => {
                if (!columns) return []

                return columns.map((column) => {
                    if (!column) return column

                    if (column.id === columnId) {
                        const updatedComponents = (column.components || []).map((component) => {
                            if (component.id === componentId) {
                                return {
                                    ...component,
                                    props: {
                                        ...component.props,
                                        ...updatedProps,
                                    },
                                }
                            }
                            return component
                        })

                        return {
                            ...column,
                            components: updatedComponents,
                        }
                    }

                    if (column.childColumns && column.childColumns.length > 0) {
                        return {
                            ...column,
                            childColumns: updateColumns(column.childColumns),
                        }
                    }

                    return column
                })
            }

            return {
                ...prevLayout,
                columns: updateColumns(prevLayout.columns || []),
            }
        })
    }

    const handleDeleteComponent = (componentId, columnId) => {
        setLayout((prevLayout) => {
            // Recursive function to update nested columns
            const updateColumns = (columns) => {
                if (!columns) return []

                return columns.map((column) => {
                    if (!column) return column

                    if (column.id === columnId) {
                        return {
                            ...column,
                            components: (column.components || []).filter((component) => component.id !== componentId),
                        }
                    }

                    if (column.childColumns && column.childColumns.length > 0) {
                        return {
                            ...column,
                            childColumns: updateColumns(column.childColumns),
                        }
                    }

                    return column
                })
            }

            return {
                ...prevLayout,
                columns: updateColumns(prevLayout.columns || []),
            }
        })

        if (selectedComponentId === componentId) {
            setSelectedComponentId(null)
        }
    }

    const handleAddColumn = (orientation, parentColumnId) => {
        const newColumn = {
            id: `column-${Date.now()}`,
            width: 12,
            components: [],
            orientation,
            childColumns: [],
            parentId: parentColumnId,
            flexLayout: "items-start justify-start",
            gap: "0",
        }

        setLayout((prevLayout) => {
            // If adding to the root level
            if (!parentColumnId) {
                // If adding horizontally, adjust widths to make equal columns
                let updatedColumns = [...(prevLayout.columns || [])]

                if (orientation === "horizontal") {
                    const columnCount = updatedColumns.length + 1
                    const equalWidth = Math.floor(12 / columnCount)

                    updatedColumns = updatedColumns.map((column) => ({
                        ...column,
                        width: equalWidth,
                    }))

                    newColumn.width = equalWidth
                }

                return {
                    ...prevLayout,
                    columns: [...updatedColumns, newColumn],
                }
            }
            // If adding to a nested column
            else {
                // Recursive function to update nested columns
                const updateColumns = (columns) => {
                    if (!columns) return []

                    return columns.map((column) => {
                        if (!column) return column

                        if (column.id === parentColumnId) {
                            // Initialize childColumns if it doesn't exist
                            const childColumns = column.childColumns || []

                            // If adding horizontally, adjust widths
                            let updatedChildColumns = [...childColumns]

                            if (orientation === "horizontal" && updatedChildColumns.length > 0) {
                                const columnCount = updatedChildColumns.length + 1
                                const equalWidth = Math.floor(12 / columnCount)

                                updatedChildColumns = updatedChildColumns.map((childColumn) => ({
                                    ...childColumn,
                                    width: equalWidth,
                                }))

                                newColumn.width = equalWidth
                            }

                            return {
                                ...column,
                                childColumns: [...updatedChildColumns, newColumn],
                            }
                        }

                        if (column.childColumns && column.childColumns.length > 0) {
                            return {
                                ...column,
                                childColumns: updateColumns(column.childColumns),
                            }
                        }

                        return column
                    })
                }

                return {
                    ...prevLayout,
                    columns: updateColumns(prevLayout.columns || []),
                }
            }
        })

        // Select the new column
        setSelectedColumnId(newColumn.id)
    }

    const handleDeleteColumn = (columnId) => {
        setLayout((prevLayout) => {
            // Don't delete if it's the last root column
            if ((prevLayout.columns || []).length <= 1 && prevLayout.columns?.[0]?.id === columnId) {
                return prevLayout
            }

            // Recursive function to update nested columns
            const updateColumns = (columns) => {
                if (!columns) return []

                // Filter out the column to delete
                const filteredColumns = columns.filter((column) => column && column.id !== columnId)

                // If we removed a column at this level, redistribute widths
                if (filteredColumns.length < columns.length) {
                    const horizontalColumns = filteredColumns.filter((col) => col && col.orientation === "horizontal")

                    if (horizontalColumns.length > 0) {
                        const equalWidth = Math.floor(12 / horizontalColumns.length)

                        filteredColumns.forEach((column) => {
                            if (column && column.orientation === "horizontal") {
                                column.width = equalWidth
                            }
                        })
                    }

                    return filteredColumns
                }

                // Otherwise, check nested columns
                return columns.map((column) => {
                    if (!column) return column

                    if (column.childColumns && column.childColumns.length > 0) {
                        const updatedChildColumns = updateColumns(column.childColumns)

                        // If we removed a child column, redistribute widths
                        if (updatedChildColumns.length < (column.childColumns || []).length) {
                            const horizontalColumns = updatedChildColumns.filter((col) => col && col.orientation === "horizontal")

                            if (horizontalColumns.length > 0) {
                                const equalWidth = Math.floor(12 / horizontalColumns.length)

                                updatedChildColumns.forEach((childColumn) => {
                                    if (childColumn && childColumn.orientation === "horizontal") {
                                        childColumn.width = equalWidth
                                    }
                                })
                            }
                        }

                        return {
                            ...column,
                            childColumns: updatedChildColumns,
                        }
                    }

                    return column
                })
            }

            return {
                ...prevLayout,
                columns: updateColumns(prevLayout.columns || []),
            }
        })

        // Clear selected component if it was in the deleted column
        const selectedComponent = getSelectedComponent()
        if (selectedComponent.columnId === columnId) {
            setSelectedComponentId(null)
        }

        // Clear selected column if it was deleted
        if (selectedColumnId === columnId) {
            setSelectedColumnId(null)
        }
    }

    const handleUpdateColumnWidth = (columnId, width) => {
        setLayout((prevLayout) => {
            // Recursive function to update nested columns
            const updateColumns = (columns) => {
                if (!columns) return []

                return columns.map((column) => {
                    if (!column) return column

                    if (column.id === columnId) {
                        return {
                            ...column,
                            width: Math.min(Math.max(1, width), 12), // Ensure width is between 1 and 12
                        }
                    }

                    if (column.childColumns && column.childColumns.length > 0) {
                        return {
                            ...column,
                            childColumns: updateColumns(column.childColumns),
                        }
                    }

                    return column
                })
            }

            return {
                ...prevLayout,
                columns: updateColumns(prevLayout.columns || []),
            }
        })
    }

    const handleUpdateContainerWidth = (width) => {
        setLayout((prevLayout) => ({
            ...prevLayout,
            containerWidth: width,
        }))
    }

    const handleMoveComponent = useCallback((dragIndex, hoverIndex, sourceColumnId, targetColumnId) => {
        setLayout((prevLayout) => {
            // Helper function to find a column by ID
            const findColumn = (columns, id) => {
                if (!columns) return null

                for (const column of columns) {
                    if (!column) continue

                    if (column.id === id) {
                        return column
                    }
                    if (column.childColumns && column.childColumns.length > 0) {
                        const found = findColumn(column.childColumns, id)
                        if (found) return found
                    }
                }
                return null
            }

            // Clone the layout to avoid mutating state directly
            const newLayout = { ...prevLayout, columns: JSON.parse(JSON.stringify(prevLayout.columns || [])) }

            // Find source and target columns
            const sourceColumn = findColumn(newLayout.columns, sourceColumnId)
            const targetColumn = findColumn(newLayout.columns, targetColumnId)

            if (!sourceColumn || !targetColumn) return prevLayout

            // If moving within the same column
            if (sourceColumnId === targetColumnId) {
                const component = sourceColumn.components[dragIndex]
                sourceColumn.components.splice(dragIndex, 1)
                sourceColumn.components.splice(hoverIndex, 0, component)
            }
            // If moving between different columns
            else {
                const component = sourceColumn.components[dragIndex]
                sourceColumn.components.splice(dragIndex, 1)
                targetColumn.components.splice(hoverIndex, 0, component)
            }

            return newLayout
        })
    }, [])

    const handleMoveColumn = useCallback((dragIndex, hoverIndex, parentId = null) => {
        setLayout((prevLayout) => {
            // Helper function to find parent column's childColumns array
            const findChildColumns = (columns, parentId) => {
                if (!columns) return null

                for (const column of columns) {
                    if (!column) continue

                    if (column.id === parentId) {
                        return column.childColumns || []
                    }
                    if (column.childColumns && column.childColumns.length > 0) {
                        const found = findChildColumns(column.childColumns, parentId)
                        if (found) return found
                    }
                }
                return null
            }

            // Clone the layout to avoid mutating state directly
            const newLayout = { ...prevLayout, columns: JSON.parse(JSON.stringify(prevLayout.columns || [])) }

            // Determine which array of columns we're working with
            let columnsArray
            if (parentId) {
                const childColumns = findChildColumns(newLayout.columns, parentId)
                if (!childColumns) return prevLayout
                columnsArray = childColumns
            } else {
                columnsArray = newLayout.columns || []
            }

            // Move the column
            const [movedColumn] = columnsArray.splice(dragIndex, 1)
            columnsArray.splice(hoverIndex, 0, movedColumn)

            // Recalculate widths for horizontal columns
            const horizontalColumns = columnsArray.filter((col) => col && col.orientation === "horizontal")
            if (horizontalColumns.length > 0) {
                const equalWidth = Math.floor(12 / horizontalColumns.length)
                horizontalColumns.forEach((col) => {
                    if (col) col.width = equalWidth
                })
            }

            return newLayout
        })
    }, [])
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isBackendPage = location.pathname === '/backend';

    const handleLoadTemplate = (templateLayout) => {
        setLayout(templateLayout)
        setSelectedComponentId(null)
        setSelectedColumnId(null)
        setShowTemplates(false)
        alert("The template has been loaded successfully.")
    }

    const handleUpdateColumn = (columnId, updates) => {
        setLayout((prevLayout) => {
            // Recursive function to update nested columns
            const updateColumns = (columns) => {
                if (!columns) return []

                return columns.map((column) => {
                    if (!column) return column

                    if (column.id === columnId) {
                        return {
                            ...column,
                            ...updates,
                        }
                    }

                    if (column.childColumns && column.childColumns.length > 0) {
                        return {
                            ...column,
                            childColumns: updateColumns(column.childColumns),
                        }
                    }

                    return column
                })
            }

            return {
                ...prevLayout,
                columns: updateColumns(prevLayout.columns || []),
            }
        })
    }

    const { component, columnId } = getSelectedComponent()
    const selectedColumn = getSelectedColumn()
    const generatedReactCode = generateReactCode(layout)
    const generatedVueCode = generateVueCode(layout)
    if (layout && Array.isArray(layout.rows)) {
        const generatedVueCode = generateVueCode(layout);
    }
    const generatedCode = codeFormat === "react" ? generatedReactCode : generatedVueCode
    if (showTemplates) {
        return (
            <TemplatesManager
                onBack={() => setShowTemplates(false)}
                onLoadTemplate={handleLoadTemplate}
                onCreateNew={() => {
                    setLayout(DEFAULT_LAYOUT)
                    setShowTemplates(false)
                }}
            />
        )
    }
    const handleCodeChange = (newCode) => {
        // Here you could implement a parser to update the layout from code changes
        // For now, we'll just update the code without modifying the layout
        console.log("Code updated in editor");

        // If you want to implement code -> layout parsing in the future,
        // this is where you would do it
    }

    // Toggle code panel visibility
    const toggleCodePanel = () => {
        setShowCodePanel(!showCodePanel);
    }
    return (
        <div className="flex flex-col">
            <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div className="flex space-x-10 items-center">
                    <Link to={'/'}>
                        <h1 className={`text-2xl font-mono font-bold text-black ${isHomePage ? 'underline decoration-2 underline-offset-4' : ''}`}>
                            Frontend Builder
                        </h1>
                    </Link>

                    <p
                        className={`text-2xl font-mono font-bold text-black `}
                    >
                        or
                    </p>
                    <Link to={'/backend'}>
                        <h1 className={`text-2xl font-mono font-bold text-black ${isBackendPage ? 'underline decoration-2 underline-offset-4' : ''}`}>
                            Backend Builder
                        </h1>
                    </Link>
                </div>
                <div className="flex space-x-2">
                    <button
                        className="px-4 py-2 bg-white hover:bg-gray-100 border border-black rounded-none text-sm font-mono font-medium flex items-center transition-colors"
                        onClick={resetState}
                    >
                        <RotateCcw className="h-4 w-4 mr-2 text-black" />
                        <span>Reset</span>
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                        onClick={() => setSaveTemplateDialogOpen(true)}
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
                                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        Save as Template
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                        onClick={() => setShowTemplates(true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Templates
                    </button>
                    <button
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                        onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
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
                                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                        </svg>
                        {showPropertiesPanel ? "Hide Properties" : "Show Properties"}
                    </button>
                 
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {!showPreview && (
                    <ComponentPaletteAndRenderer
                        onAddComponent={(type) => {
                            // Add to selected column if one is selected, otherwise add to first column
                            const targetColumnId =
                                selectedColumnId || (layout.columns && layout.columns[0] ? layout.columns[0].id : null)
                            if (targetColumnId) {
                                handleAddComponent(type, targetColumnId)
                            }
                        }}
                        selectedColumnId={selectedColumnId}
                    />
                )}

                <div className="flex-1 flex flex-col overflow-hidden">
                    {showPreview ? (
                        <div className="flex-1 p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                                    onClick={() => setShowPreview(false)}
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
                                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                        />
                                    </svg>
                                    Back to Editor
                                </button>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium">Code Format:</span>
                                    <div className="flex border rounded-md overflow-hidden">
                                        <button
                                            className={`px-3 py-1 text-sm ${codeFormat === "react" ? "bg-blue-500 text-white" : "bg-white text-gray-700"
                                                }`}
                                            onClick={() => setCodeFormat("react")}
                                        >
                                            React
                                        </button>
                                        <button
                                            className={`px-3 py-1 text-sm ${codeFormat === "vue" ? "bg-blue-500 text-white" : "bg-white text-gray-700"
                                                }`}
                                            onClick={() => setCodeFormat("vue")}
                                        >
                                            Vue
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 border border-gray-300 rounded-md overflow-hidden">
                                <pre className="bg-gray-50 p-4 rounded-md overflow-auto h-full text-sm">
                                    <code>{generatedCode}</code>
                                </pre>
                            </div>
                        </div>
                    ) : (
                        <LayoutEditor
                            layout={layout}
                            selectedComponentId={selectedComponentId}
                            selectedColumnId={selectedColumnId}
                            onSelectComponent={setSelectedComponentId}
                            onSelectColumn={setSelectedColumnId}
                            onAddComponent={handleAddComponent}
                            onDeleteComponent={handleDeleteComponent}
                            onAddColumn={handleAddColumn}
                            onDeleteColumn={handleDeleteColumn}
                            onUpdateColumnWidth={handleUpdateColumnWidth}
                            onUpdateContainerWidth={handleUpdateContainerWidth}
                            onMoveComponent={handleMoveComponent}
                            onMoveColumn={handleMoveColumn}
                            onUpdateColumn={handleUpdateColumn}
                        />
                    )}
                </div>

                {showPropertiesPanel && !showPreview && (
                    <PropertiesAndCodePanel
                        component={component}
                        columnId={columnId}
                        column={selectedColumn}
                        onUpdateComponent={handleUpdateComponent}
                        onUpdateColumn={handleUpdateColumn}
                        code={generatedCode}
                        codeFormat={codeFormat}
                        onChangeCodeFormat={setCodeFormat}
                    />
                )}
            </div>

            {saveTemplateDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h2 className="text-xl font-semibold mb-4">Save Layout Template</h2>
                        <p className="text-gray-600 mb-4">Save your current layout as a template for future use.</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="My Template"
                                id="template-name"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md" id="template-category">
                                <option value="general">General</option>
                                <option value="forms">Forms</option>
                                <option value="landing">Landing Pages</option>
                                <option value="dashboard">Dashboards</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                onClick={() => setSaveTemplateDialogOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                onClick={() => {
                                    const name = document.getElementById("template-name").value
                                    const category = document.getElementById("template-category").value
                                    if (!name) {
                                        alert("Template name is required")
                                        return
                                    }
                                    saveTemplate(name, category, layout)
                                    setSaveTemplateDialogOpen(false)
                                }}
                            >
                                Save Template
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full border border-t-black ">
                <div className="flex items-center space-x-4">
                    <span className="text-2xl font-mono font-medium">Format:</span>
                    <div className="relative p-3" >
                        <select
                            value={codeFormat}
                            onChange={(e) => setCodeFormat(e.target.value)}
                            className="appearance-none bg-white border-2 text-lg font-bold border-black hover:border-gray-400 focus:border-black focus:outline-none px-2 focus:ring-0 rounded-md w-24 py-1 pr-10 text-sm font-mono transition-colors cursor-pointer"
                        >
                            <option  value="react">React</option>
                            <option value="vue">Vue</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 mr-3 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-black " />
                        </div>
                    </div>
                </div>
                <CodePanel
                    code={generatedCode}
                    language="jsx" // or "javascript", "html", "css", etc.
                    onChange={handleCodeChange}
                    showPreview={true}
                    codeFormat="react" // or "vue", "html"
                    theme="dark" // or "light"
                />
            </div>
        </div>
    )
}

export default UIBuilder