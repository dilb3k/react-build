"use client"

import { useState, useCallback, useEffect } from "react"

import TemplatesManager from "./TemplatesManager"
import { Link, useLocation } from "react-router-dom"
import BackendCodeGenerator from "./BackendCodeGenerator"
import { RotateCcw } from "lucide-react"


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

function BackendUIBuilder() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isBackendPage = location.pathname === '/backend';


    const [layout, setLayout] = useState(DEFAULT_LAYOUT)
    const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
    const [showPreview, setShowPreview] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)

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






    const handleLoadTemplate = (templateLayout) => {
        setLayout(templateLayout)
        setSelectedComponentId(null)
        setSelectedColumnId(null)
        setShowTemplates(false)
        alert("The template has been loaded successfully.")
    }




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

    return (
        <div className="flex flex-col">
            <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <div className="flex space-x-10 items-center">
                    <Link to={'/'}>
                        <h1 className={`text-2xl font-mono font-bold text-black ${isHomePage ? 'underline decoration-2 underline-offset-4' : ''}`}>
                            Frontend Builder
                        </h1>
                    </Link>

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
                </div>
            </header>
            <div className="p-4">
                <BackendCodeGenerator />
            </div>


        </div>
    )
}

export default BackendUIBuilder