"use client"

import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"

function LayoutEditor({
    layout,
    selectedComponentId,
    selectedColumnId,
    onSelectComponent,
    onSelectColumn,
    onAddComponent,
    onDeleteComponent,
    onAddColumn,
    onDeleteColumn,
    onUpdateColumnWidth,
    onUpdateContainerWidth,
    onMoveComponent,
    onMoveColumn,
    onUpdateColumn,
}) {
    const handleDragOver = (e) => {
        e.preventDefault()
    }

    const handleDrop = (e, columnId) => {
        e.preventDefault()
        const componentType = e.dataTransfer.getData("componentType")
        if (componentType) {
            onAddComponent(componentType, columnId)
        }
    }

    const getColumnWidthClass = (width) => {
        const widthMap = {
            1: "w-1/12",
            2: "w-2/12",
            3: "w-3/12",
            4: "w-4/12",
            5: "w-5/12",
            6: "w-6/12",
            7: "w-7/12",
            8: "w-8/12",
            9: "w-9/12",
            10: "w-10/12",
            11: "w-11/12",
            12: "w-full",
        }
        return widthMap[width] || "w-full"
    }

    // Define renderColumns function at the component level so it can be passed to child components
    const renderColumns = (columns = [], parentId = null) => {
        // Add a null check for columns
        if (!columns || columns.length === 0) {
            return <div className="flex flex-wrap"></div>
        }

        return (
            <div className="flex flex-wrap">
                {columns.map((column, index) => {
                    // Skip rendering if column is undefined
                    if (!column) return null

                    return (
                        <ColumnItem
                            key={column.id}
                            column={column}
                            index={index}
                            parentId={parentId}
                            selectedComponentId={selectedComponentId}
                            selectedColumnId={selectedColumnId}
                            onSelectComponent={onSelectComponent}
                            onSelectColumn={onSelectColumn}
                            onAddComponent={onAddComponent}
                            onDeleteComponent={onDeleteComponent}
                            onAddColumn={onAddColumn}
                            onDeleteColumn={onDeleteColumn}
                            onUpdateColumnWidth={onUpdateColumnWidth}
                            onMoveComponent={onMoveComponent}
                            onMoveColumn={onMoveColumn}
                            getColumnWidthClass={getColumnWidthClass}
                            handleDragOver={handleDragOver}
                            handleDrop={handleDrop}
                            renderColumns={renderColumns} // Pass the renderColumns function as a prop
                            onUpdateColumn={onUpdateColumn}
                        />
                    )
                })}
            </div>
        )
    }

    return (
        <div className="flex-1 p-4 overflow-auto">
            <div className="mb-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Container Width:</span>
                    <input
                        type="text"
                        value={layout.containerWidth}
                        onChange={(e) => onUpdateContainerWidth(e.target.value)}
                        className="w-32 px-2 py-1 border border-gray-300 rounded-md"
                    />
                </div>
                <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                    onClick={() => onAddColumn("horizontal")}
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
                            d="M9 17V7m0 10h6m-6 0H3m3-10h6m6 0v10m0-10h-6"
                        />
                    </svg>
                    Add Horizontal Column
                </button>
                <button
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center"
                    onClick={() => onAddColumn("vertical")}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Vertical Column
                </button>
            </div>

            <div className="border border-gray-300 rounded-md p-4 min-h-[500px]" style={{ width: layout.containerWidth }}>
                {renderColumns(layout.columns)}
            </div>
        </div>
    )
}

function ColumnItem({
    column,
    index,
    parentId,
    selectedComponentId,
    selectedColumnId,
    onSelectComponent,
    onSelectColumn,
    onAddComponent,
    onDeleteComponent,
    onAddColumn,
    onDeleteColumn,
    onUpdateColumnWidth,
    onMoveComponent,
    onMoveColumn,
    getColumnWidthClass,
    handleDragOver,
    handleDrop,
    renderColumns,
    onUpdateColumn,
}) {
    const ref = useRef(null)

    // Ensure column has orientation property with a default value
    const orientation = column?.orientation || "horizontal"

    // Set up drag for column
    const [{ isDragging }, drag] = useDrag({
        type: "COLUMN",
        item: { type: "COLUMN", id: column.id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    // Set up drop for column
    const [{ isOver }, drop] = useDrop({
        accept: "COLUMN",
        hover(item, monitor) {
            if (!ref.current) {
                return
            }

            // Only handle items of type COLUMN
            if (item.type !== "COLUMN") {
                return
            }

            const dragIndex = item.index
            const hoverIndex = index

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return
            }

            // Time to actually perform the action
            onMoveColumn(dragIndex, hoverIndex, parentId)

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    // Initialize drag and drop refs
    drag(drop(ref))

    const isSelected = selectedColumnId === column.id

    // Ensure column has components array
    const components = column?.components || []

    // Ensure column has childColumns array
    const childColumns = column?.childColumns || []

    return (
        <div
            ref={ref}
            className={`${orientation === "horizontal" ? getColumnWidthClass(column.width) : "w-full"} p-2`}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            <div
                className={`border border-dashed ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    } rounded-md p-4 min-h-[100px] relative`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
                onClick={(e) => {
                    e.stopPropagation()
                    onSelectColumn(column.id)
                }}
            >
                <div className="absolute top-2 right-2 flex space-x-1">
                    {orientation === "horizontal" && (
                        <div className="flex items-center space-x-1 mr-2">
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={column.width}
                                onChange={(e) => onUpdateColumnWidth(column.id, Number.parseInt(e.target.value))}
                                className="w-16 h-6 text-xs px-1 border border-gray-300 rounded"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span className="text-xs text-gray-500">/ 12</span>
                        </div>
                    )}
                    <button
                        className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                            e.stopPropagation()
                            onAddColumn("horizontal", column.id)
                        }}
                        title="Add Nested Horizontal Column"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <button
                        className="h-6 w-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDeleteColumn(column.id)
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>

                {isSelected && (
                    <div className="absolute top-2 left-2">
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md">Selected Column</span>
                    </div>
                )}

                {components.length === 0 && childColumns.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[80px] text-gray-400">
                        {isSelected ? "Click a component to add here" : "Click to select this column"}
                    </div>
                ) : (
                    <div className="space-y-2 pt-6">
                        {components.map((component, compIndex) => (
                            <ComponentItem
                                key={component.id}
                                component={component}
                                index={compIndex}
                                columnId={column.id}
                                isSelected={selectedComponentId === component.id}
                                onSelect={() => onSelectComponent(component.id)}
                                onDelete={() => onDeleteComponent(component.id, column.id)}
                                onMoveComponent={onMoveComponent}
                            />
                        ))}
                    </div>
                )}

                {childColumns.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                        {/* Use the renderColumns prop here */}
                        {renderColumns(childColumns, column.id)}
                    </div>
                )}
            </div>
        </div>
    )
}

function ComponentItem({ component, index, columnId, isSelected, onSelect, onDelete, onMoveComponent }) {
    const ref = useRef(null)

    // Set up drag for component
    const [{ isDragging }, drag] = useDrag({
        type: "COMPONENT",
        item: { type: "COMPONENT", id: component.id, index, columnId },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    // Set up drop for component
    const [{ isOver }, drop] = useDrop({
        accept: "COMPONENT",
        hover(item, monitor) {
            if (!ref.current) {
                return
            }

            // Only handle items of type COMPONENT
            if (item.type !== "COMPONENT") {
                return
            }

            const dragIndex = item.index
            const hoverIndex = index
            const sourceColumnId = item.columnId
            const targetColumnId = columnId

            // Don't replace items with themselves
            if (dragIndex === hoverIndex && sourceColumnId === targetColumnId) {
                return
            }

            // Time to actually perform the action
            onMoveComponent(dragIndex, hoverIndex, sourceColumnId, targetColumnId)

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex
            item.columnId = targetColumnId
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    // Initialize drag and drop refs
    drag(drop(ref))

    // Render a placeholder for the component
    const renderComponentPlaceholder = () => {
        const { type, props = {} } = component

        switch (type) {
            case "button":
                return (
                    <div className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-md text-center">
                        Button: {props.text || "Button"}
                    </div>
                )
            case "input":
                return (
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md">
                        Input: {props.placeholder || "Enter text..."}
                    </div>
                )
            case "text":
                const Element = props.element || "p"
                return (
                    <div className="px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-md">
                        {Element.toUpperCase()}: {props.text || "Text content"}
                    </div>
                )
            case "image":
                return (
                    <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-md flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
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
                        Image: {props.alt || "Image"}
                    </div>
                )
            case "div":
                return (
                    <div className="px-4 py-2 bg-purple-100 border border-purple-300 rounded-md">
                        Div: {props.text || "Div Container"}
                    </div>
                )
            default:
                return <div>Unknown component type: {type}</div>
        }
    }

    return (
        <div
            ref={ref}
            className={`p-2 rounded-md ${isSelected ? "ring-2 ring-blue-500" : "hover:bg-gray-50"} ${isDragging ? "opacity-50" : "opacity-100"
                } ${isOver ? "bg-gray-100" : ""}`}
            onClick={(e) => {
                e.stopPropagation()
                onSelect()
            }}
            style={{ cursor: "move" }}
        >
            <div className="relative">
                {isSelected && (
                    <div className="absolute top-0 right-0 z-10">
                        <button
                            className="h-6 w-6 flex items-center justify-center text-red-500 hover:text-red-700 bg-white rounded-full shadow"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete()
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>
                )}
                <div className={isSelected ? "opacity-80" : ""}>{renderComponentPlaceholder()}</div>
            </div>
        </div>
    )
}

export default LayoutEditor