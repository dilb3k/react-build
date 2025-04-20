function generateReactCode(layout) {
    const imports = generateImports(layout)
    const componentCode = generateComponentCode(layout)

    return `${imports}

function GeneratedUI() {
  return (
${componentCode}
  );
}

export default GeneratedUI;`
}

function generateImports(layout) {
    const importMap = {
        react: new Set(["useState", "useEffect"]),
    }

    // Helper function to analyze components in columns
    const analyzeComponents = (columns = []) => {
        if (!columns) return

        columns.forEach((column) => {
            if (!column) return

            if (column.components) {
                column.components.forEach((component) => {
                    if (!component) return

                    // No need to import components in plain React
                })
            }

            // Recursively analyze nested columns
            if (column.childColumns && column.childColumns.length > 0) {
                analyzeComponents(column.childColumns)
            }
        })
    }

    // Start analysis from root columns
    analyzeComponents(layout.columns)

    // Generate import statements
    let importStatements = "import React from 'react';\n"

    for (const [module, components] of Object.entries(importMap)) {
        if (components.size > 0 && module !== "react") {
            importStatements += `import { ${Array.from(components).join(", ")} } from "${module}";\n`
        }
    }

    return importStatements
}

function generateComponentCode(layout) {
    let code = `    <div style={{ width: "${layout.containerWidth || "100%"}", margin: "0 auto" }}>\n`

    // Helper function to recursively generate column code
    const generateColumnsCode = (columns = [], indentLevel = 6) => {
        if (!columns || columns.length === 0) {
            return `${" ".repeat(indentLevel)}<div className="flex flex-wrap"></div>`
        }

        const indent = " ".repeat(indentLevel)
        let columnsCode = ""

        columns.forEach((column) => {
            if (!column) return

            const orientation = column.orientation || "horizontal"
            const columnWidthClass = getColumnWidthClass(column.width)
            const flexDirection = orientation === "horizontal" ? "row" : "column"

            // Add flex layout and gap classes if they exist
            const flexLayout = column.flexLayout || "items-start justify-start"
            const flexGap = column.gap || "0"

            // Extract items and justify values from flexLayout
            const itemsMatch = flexLayout.match(/items-([a-z-]+)/)
            const justifyMatch = flexLayout.match(/justify-([a-z-]+)/)
            const itemsValue = itemsMatch ? itemsMatch[1] : "start"
            const justifyValue = justifyMatch ? justifyMatch[1] : "start"

            // Convert Tailwind-like classes to CSS styles
            const alignItems = convertAlignItems(itemsValue)
            const justifyContent = convertJustifyContent(justifyValue)
            const gap = `${flexGap}rem`

            columnsCode += `${indent}<div className="${columnWidthClass} p-2">\n`
            columnsCode += `${indent}  <div style={{ display: "flex", flexDirection: "${flexDirection}", alignItems: "${alignItems}", justifyContent: "${justifyContent}", gap: "${gap}", padding: "1rem" }}>\n`

            // Add components in this column
            if (column.components && column.components.length > 0) {
                column.components.forEach((component) => {
                    if (!component) return
                    columnsCode += `${indent}    ${renderComponent(component)}\n`
                })
            }

            // Add nested columns if they exist
            if (column.childColumns && column.childColumns.length > 0) {
                columnsCode += `${indent}    ${generateColumnsCode(column.childColumns, indentLevel + 4)}\n`
            }

            columnsCode += `${indent}  </div>\n`
            columnsCode += `${indent}</div>\n`
        })

        return columnsCode.trim()
    }

    code += generateColumnsCode(layout.columns)
    code += `\n    </div>`

    return code
}

function getColumnWidthClass(width = 12) {
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

function convertAlignItems(value) {
    const alignMap = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        stretch: "stretch",
    }
    return alignMap[value] || "flex-start"
}

function convertJustifyContent(value) {
    const justifyMap = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        between: "space-between",
        around: "space-around",
        evenly: "space-evenly",
    }
    return justifyMap[value] || "flex-start"
}

function renderComponent(component) {
    if (!component) return ""

    const { type, props = {} } = component

    switch (type) {
        case "button":
            return `<button className="px-4 py-2 rounded-md ${getButtonVariantClass(props.variant)}" ${renderProps(props)}>${props.text || "Button"}</button>`
        case "input":
            return `<input type="${props.type || "text"}" placeholder="${props.placeholder || "Enter text..."}" className="px-3 py-2 border border-gray-300 rounded-md" ${renderProps(props)} />`
        case "text":
            const Element = props.element || "p"
            return `<${Element} style={{ fontWeight: "${getFontWeight(props.fontWeight)}", textAlign: "${props.textAlign || "left"}", fontSize: "${props.fontSize || (Element === "p" ? "1rem" : "")}" }} ${renderProps(props)}>${props.text || (Element === "p" ? "Paragraph text" : `${Element.toUpperCase()} Heading`)}</${Element}>`
        case "image":
            return `<img src="${props.src || "https://via.placeholder.com/300x200"}" alt="${props.alt || "Image"}" style={{ width: "${props.width || "100%"}", height: "${props.height || "auto"}" }} ${renderProps(props)} />`
        case "div":
            return `<div style={{ backgroundColor: "${props.backgroundColor || "transparent"}", padding: "${props.padding || "1rem"}", borderRadius: "${props.borderRadius || "0.25rem"}", border: "${props.border || "none"}", minHeight: "50px" }} ${renderProps(props)}>${props.text || "Div Container"}</div>`
        default:
            return `<div>Unknown component: ${type}</div>`
    }
}

function getButtonVariantClass(variant) {
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
        default:
            return "bg-blue-500 text-white hover:bg-blue-600"
    }
}

function getFontWeight(weight) {
    const weightMap = {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
    }
    return weightMap[weight] || "400"
}

function renderProps(props = {}) {
    let propsString = ""

    // Handle className
    if (props.className) {
        propsString += ` className="${props.className}"`
    }

    return propsString
}

export { generateReactCode }
