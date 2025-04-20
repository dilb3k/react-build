"use client"

import { useState, useEffect } from "react"

function TemplatesManager({ onBack, onLoadTemplate, onCreateNew }) {
    const [templates, setTemplates] = useState([])
    const [categories, setCategories] = useState([{ id: "general", name: "General", isDefault: true }])
    const [searchTerm, setSearchTerm] = useState("")
    const [activeCategory, setActiveCategory] = useState("all")
    const [sortBy, setSortBy] = useState("date")
    const [sortDirection, setSortDirection] = useState("desc")

    useEffect(() => {
        // Load templates from local storage
        const loadTemplates = () => {
            try {
                const savedTemplates = localStorage.getItem("ui-builder-templates")
                if (savedTemplates) {
                    setTemplates(JSON.parse(savedTemplates))
                }
            } catch (error) {
                console.error("Failed to load templates:", error)
            }
        }

        // Load categories from local storage
        const loadCategories = () => {
            try {
                const savedCategories = localStorage.getItem("ui-builder-categories")
                if (savedCategories) {
                    const parsedCategories = JSON.parse(savedCategories)
                    // Ensure General category exists
                    const hasGeneral = parsedCategories.some((cat) => cat.id === "general")
                    if (!hasGeneral) {
                        parsedCategories.unshift({ id: "general", name: "General", isDefault: true })
                    }
                    setCategories(parsedCategories)
                }
            } catch (error) {
                console.error("Failed to load categories:", error)
            }
        }

        loadTemplates()
        loadCategories()
    }, [])

    const handleDeleteTemplate = (id) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            const updatedTemplates = templates.filter((template) => template.id !== id)
            setTemplates(updatedTemplates)

            try {
                localStorage.setItem("ui-builder-templates", JSON.stringify(updatedTemplates))
            } catch (error) {
                console.error("Failed to save templates:", error)
            }
        }
    }

    const handleLoadTemplate = (template) => {
        onLoadTemplate(template.layout)
    }

    const toggleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortBy(column)
            setSortDirection("asc")
        }
    }

    // Get unique category IDs from templates
    const categoryIds = ["all", ...new Set(templates.map((template) => template.category))]

    // Map category IDs to names
    const categoryOptions = categoryIds.map((id) => {
        if (id === "all") return { id, name: "All" }
        const category = categories.find((cat) => cat.id === id)
        return { id, name: category ? category.name : id }
    })

    // Filter and sort templates
    const filteredTemplates = templates
        .filter((template) => {
            const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = activeCategory === "all" || template.category === activeCategory
            return matchesSearch && matchesCategory
        })
        .sort((a, b) => {
            if (sortBy === "name") {
                return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
            } else {
                return sortDirection === "asc"
                    ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            }
        })

    // Get category name by ID
    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId)
        return category ? category.name : categoryId
    }

    // Format date to a more readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date)
    }

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <button
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center mr-4"
                            onClick={onBack}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Builder
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Layout Templates</h1>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                            onClick={onCreateNew}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Template
                        </button>
                    </div>
                </div>
            </header>

            <div className="py-6 px-6 flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-20 w-20 text-gray-300 mb-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                                />
                            </svg>
                            <h2 className="text-2xl font-semibold mb-2 text-gray-800">No Templates Yet</h2>
                            <p className="text-gray-500 mb-6 text-center max-w-md">
                                Create your first template to get started with your UI building journey.
                            </p>
                            <button
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                                onClick={onCreateNew}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Template
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div className="w-full md:w-1/3 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input
                                        placeholder="Search templates..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categoryOptions.map((category) => (
                                        <button
                                            key={category.id}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeCategory === category.id
                                                ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                }`}
                                            onClick={() => setActiveCategory(category.id)}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 group"
                                                onClick={() => toggleSort("name")}
                                            >
                                                <div className="flex items-center">
                                                    <span>Name</span>
                                                    <span className="ml-2 text-gray-400 group-hover:text-gray-600">
                                                        {sortBy === "name" ? (
                                                            sortDirection === "asc" ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Category
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 group"
                                                onClick={() => toggleSort("date")}
                                            >
                                                <div className="flex items-center">
                                                    <span>Created</span>
                                                    <span className="ml-2 text-gray-400 group-hover:text-gray-600">
                                                        {sortBy === "date" ? (
                                                            sortDirection === "asc" ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTemplates.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-10 text-center text-sm text-gray-500">
                                                    <div className="flex flex-col items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-gray-600 font-medium mb-1">No matching templates found</p>
                                                        <p className="text-gray-400 text-sm">Try changing your search or filter criteria</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTemplates.map((template) => (
                                                <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                                                            {getCategoryName(template.category)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {formatDate(template.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-3">
                                                            <button
                                                                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-300 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                                onClick={() => handleLoadTemplate(template)}
                                                            >
                                                                Load
                                                            </button>
                                                            <button
                                                                className="text-red-500 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 p-1 rounded-full"
                                                                onClick={() => handleDeleteTemplate(template.id)}
                                                                title="Delete template"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-5 w-5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={1.5}
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TemplatesManager