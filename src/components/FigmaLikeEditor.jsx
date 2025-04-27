import { useState, useRef, useEffect } from "react";

const FigmaLikeEditor = ({
    layout,
    updateLayout,
    onSelectElement,
    selectedElement,
    selectedColumnId,
    selectedRowId,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing
}) => {
    const [draggedComponent, setDraggedComponent] = useState(null);
    const [resizedComponent, setResizedComponent] = useState(null);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState({ width: 0, height: 0 });
    const [resizeDirection, setResizeDirection] = useState("");
    const editorRef = useRef(null);

    // Handle component selection
    const handleSelectComponent = (componentId, columnId, rowId, e) => {
        e.stopPropagation();
        onSelectElement(componentId, columnId, rowId);
    };

    // Handle column selection
    const handleSelectColumn = (columnId, rowId, e) => {
        e.stopPropagation();
        onSelectElement(null, columnId, rowId);
    };

    // Handle row selection
    const handleSelectRow = (rowId, e) => {
        e.stopPropagation();
        onSelectElement(null, null, rowId);
    };

    // Start dragging a component
    const handleStartDrag = (e, componentId, columnId, rowId) => {
        e.stopPropagation();

        // Select the component first
        onSelectElement(componentId, columnId, rowId);

        const component = getComponentById(componentId, columnId, rowId);
        if (!component) return;

        setDraggedComponent({ componentId, columnId, rowId });
        setIsDragging(true);

        // Get the starting position
        const rect = e.currentTarget.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();

        setStartPos({
            x: e.clientX - rect.left + editorRef.current.scrollLeft,
            y: e.clientY - rect.top + editorRef.current.scrollTop
        });
    };

    // Start resizing a component
    const handleStartResize = (e, componentId, columnId, rowId, direction) => {
        e.stopPropagation();

        // Select the component first
        onSelectElement(componentId, columnId, rowId);

        const component = getComponentById(componentId, columnId, rowId);
        if (!component) return;

        setResizedComponent({ componentId, columnId, rowId });
        setResizeDirection(direction);
        setIsResizing(true);

        // Get the starting size
        const style = component.style || {};
        setStartSize({
            width: parseInt(style.width) || 100,
            height: parseInt(style.height) || 40
        });

        // Get the starting position
        const rect = e.currentTarget.parentElement.getBoundingClientRect();
        setStartPos({
            x: e.clientX,
            y: e.clientY
        });
    };

    // Handle mouse move for dragging and resizing
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && draggedComponent) {
                const { componentId, columnId, rowId } = draggedComponent;
                const component = getComponentById(componentId, columnId, rowId);
                if (!component) return;

                const editorRect = editorRef.current.getBoundingClientRect();
                const deltaX = e.clientX - startPos.x - editorRect.left + editorRef.current.scrollLeft;
                const deltaY = e.clientY - startPos.y - editorRect.top + editorRef.current.scrollTop;

                const newLeft = parseInt(component.style?.left) + deltaX || deltaX;
                const newTop = parseInt(component.style?.top) + deltaY || deltaY;

                updateComponentStyle(componentId, columnId, rowId, {
                    left: `${newLeft}px`,
                    top: `${newTop}px`
                });

                setStartPos({
                    x: e.clientX - editorRect.left + editorRef.current.scrollLeft,
                    y: e.clientY - editorRect.top + editorRef.current.scrollTop
                });
            }

            if (isResizing && resizedComponent) {
                const { componentId, columnId, rowId } = resizedComponent;
                const component = getComponentById(componentId, columnId, rowId);
                if (!component) return;

                const deltaX = e.clientX - startPos.x;
                const deltaY = e.clientY - startPos.y;

                let newWidth = startSize.width;
                let newHeight = startSize.height;

                // Update width/height based on resize direction
                if (resizeDirection.includes('e')) {
                    newWidth = Math.max(20, startSize.width + deltaX);
                }
                if (resizeDirection.includes('w')) {
                    newWidth = Math.max(20, startSize.width - deltaX);
                    // Also update left position for west resize
                    const newLeft = parseInt(component.style?.left) + deltaX || deltaX;
                    updateComponentStyle(componentId, columnId, rowId, {
                        left: `${newLeft}px`
                    });
                }
                if (resizeDirection.includes('s')) {
                    newHeight = Math.max(20, startSize.height + deltaY);
                }
                if (resizeDirection.includes('n')) {
                    newHeight = Math.max(20, startSize.height - deltaY);
                    // Also update top position for north resize
                    const newTop = parseInt(component.style?.top) + deltaY || deltaY;
                    updateComponentStyle(componentId, columnId, rowId, {
                        top: `${newTop}px`
                    });
                }

                updateComponentStyle(componentId, columnId, rowId, {
                    width: `${newWidth}px`,
                    height: `${newHeight}px`
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setDraggedComponent(null);
            setIsResizing(false);
            setResizedComponent(null);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, draggedComponent, resizedComponent, startPos, startSize, resizeDirection]);

    // Get a component by its ID
    const getComponentById = (componentId, columnId, rowId) => {
        const row = layout.rows.find(r => r.id === rowId);
        if (!row) return null;

        const column = row.columns.find(c => c.id === columnId);
        if (!column) return null;

        return column.components.find(c => c.id === componentId);
    };

    // Update a component's style
    const updateComponentStyle = (componentId, columnId, rowId, style) => {
        const newLayout = JSON.parse(JSON.stringify(layout));

        const rowIndex = newLayout.rows.findIndex(r => r.id === rowId);
        if (rowIndex === -1) return;

        const columnIndex = newLayout.rows[rowIndex].columns.findIndex(c => c.id === columnId);
        if (columnIndex === -1) return;

        const componentIndex = newLayout.rows[rowIndex].columns[columnIndex].components.findIndex(c => c.id === componentId);
        if (componentIndex === -1) return;

        newLayout.rows[rowIndex].columns[columnIndex].components[componentIndex].style = {
            ...newLayout.rows[rowIndex].columns[columnIndex].components[componentIndex].style,
            ...style
        };

        updateLayout(newLayout);
    };

    // Render resize handles for a component
    const renderResizeHandles = (componentId, columnId, rowId) => {
        return (
            <>
                <div
                    className="resize-handle resize-n"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "n")}
                />
                <div
                    className="resize-handle resize-e"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "e")}
                />
                <div
                    className="resize-handle resize-s"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "s")}
                />
                <div
                    className="resize-handle resize-w"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "w")}
                />
                <div
                    className="resize-handle resize-ne"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "ne")}
                />
                <div
                    className="resize-handle resize-se"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "se")}
                />
                <div
                    className="resize-handle resize-sw"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "sw")}
                />
                <div
                    className="resize-handle resize-nw"
                    onMouseDown={(e) => handleStartResize(e, componentId, columnId, rowId, "nw")}
                />
            </>
        );
    };

    // Render a component
    const renderComponent = (component, columnId, rowId) => {
        const isSelected = selectedElement &&
            selectedElement.elementId === component.id &&
            selectedElement.columnId === columnId &&
            selectedElement.rowId === rowId;

        const componentStyle = {
            ...component.style,
            position: 'absolute'
        };

        const componentProps = component.props || {};

        const componentClasses = `editor-component ${isSelected ? 'selected' : ''}`;

        return (
            <div
                key={component.id}
                className={componentClasses}
                style={componentStyle}
                onClick={(e) => handleSelectComponent(component.id, columnId, rowId, e)}
                onMouseDown={(e) => handleStartDrag(e, component.id, columnId, rowId)}
            >
                {renderComponentByType(component)}
                {isSelected && renderResizeHandles(component.id, columnId, rowId)}
            </div>
        );
    };

    // Render a component based on its type
    const renderComponentByType = (component) => {
        const { type, props = {}, style = {} } = component;

        switch (type) {
            case 'button':
                return <button style={style}>{props.text || 'Button'}</button>;

            case 'input':
                return <input
                    type={props.type || 'text'}
                    placeholder={props.placeholder || 'Enter text...'}
                    style={style}
                />;

            case 'div':
                return <div style={style}>{props.text || 'Div Content'}</div>;

            case 'heading':
                const HeadingTag = `h${props.level || 2}`;
                return <HeadingTag style={style}>{props.text || 'Heading'}</HeadingTag>;

            case 'paragraph':
            case 'text':
                return <p style={style}>{props.text || 'Text content'}</p>;

            case 'image':
                return <img
                    src={props.src || '/placeholder.svg?height=100&width=100'}
                    alt={props.alt || 'Image'}
                    style={style}
                />;

            default:
                return <div style={style}>Unknown component type: {type}</div>;
        }
    };

    // Render a column
    const renderColumn = (column, rowId) => {
        const isSelected = selectedColumnId === column.id && selectedRowId === rowId && !selectedElement;

        const columnStyle = {
            ...column.style,
            position: 'relative',
            border: isSelected ? '2px solid #4285f4' : '1px dashed #ccc'
        };

        return (
            <div
                key={column.id}
                className={`editor-column ${isSelected ? 'selected' : ''}`}
                style={columnStyle}
                onClick={(e) => handleSelectColumn(column.id, rowId, e)}
            >
                {column.components.map(component => renderComponent(component, column.id, rowId))}
            </div>
        );
    };

    // Render a row
    const renderRow = (row) => {
        const isSelected = selectedRowId === row.id && !selectedColumnId && !selectedElement;

        return (
            <div
                key={row.id}
                className={`editor-row ${isSelected ? 'selected' : ''}`}
                onClick={(e) => handleSelectRow(row.id, e)}
            >
                {row.columns.map(column => renderColumn(column, row.id))}
            </div>
        );
    };

    // Clear selection when clicking on the editor background
    const handleEditorClick = (e) => {
        if (e.target === editorRef.current) {
            onSelectElement(null, null, null);
        }
    };

    return (
        <div
            className="figma-like-editor"
            ref={editorRef}
            onClick={handleEditorClick}
        >
            <div className="editor-canvas">
                {layout.rows.map(renderRow)}
            </div>
        </div>
    );
};

export default FigmaLikeEditor;
