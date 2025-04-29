// UI Generator Functions
function generateReactCode(layout) {
    const imports = generateImports(layout);
    const componentCode = generateComponentCode(layout);

    // Generate state and handlers for components
    let stateDefinitions = "";
    let handlerDefinitions = "";
    let selectCount = 0;
    let inputCount = 0;
    let buttonCount = 0;
    let modalCount = 0;

    const collectComponentStates = (columns = []) => {
        columns.forEach((column) => {
            if (column.components) {
                column.components.forEach((component) => {
                    if (component.type === "select") {
                        stateDefinitions += `  const [selectedValue${selectCount}, setSelectedValue${selectCount}] = React.useState("");\n`;
                        selectCount++;
                    } else if (component.type === "input") {
                        stateDefinitions += `  const [inputValue${inputCount}, setInputValue${inputCount}] = React.useState("");\n`;
                        inputCount++;
                    } else if (component.type === "button") {
                        handlerDefinitions += `  const handleButtonClick${buttonCount} = () => {
    console.log("Button ${component.props?.text || "clicked"}");
  };\n`;
                        buttonCount++;
                    } else if (component.type === "modal") {
                        stateDefinitions += `  const [isModalOpen${modalCount}, setIsModalOpen${modalCount}] = React.useState(${component.props?.isOpen || false});\n`;
                        handlerDefinitions += `  const handleModalToggle${modalCount} = () => {
    setIsModalOpen${modalCount}((prev) => !prev);
  };\n`;
                        modalCount++;
                    }
                });
            }
            if (column.childColumns) collectComponentStates(column.childColumns);
        });
    };
    collectComponentStates(layout.columns);

    return `${imports}

function GeneratedUI() {
${stateDefinitions}
${handlerDefinitions}
  return (
${componentCode}
  );
}

export default GeneratedUI;
`;
}

function generateImports(layout) {
    const importMap = {
        react: new Set(["useState"]),
    };

    // Analyze components to determine additional imports
    const analyzeComponents = (columns = []) => {
        if (!columns) return;

        columns.forEach((column) => {
            if (!column) return;

            if (column.components) {
                column.components.forEach((component) => {
                    if (!component) return;
                    // Add imports for specific components if needed
                });
            }

            if (column.childColumns && column.childColumns.length > 0) {
                analyzeComponents(column.childColumns);
            }
        });
    };

    analyzeComponents(layout.columns);

    // Generate import statements
    let importStatements = "import React, { useState } from 'react';\n";
    return importStatements;
}

function generateComponentCode(layout) {
    let code = `    <div style={{ width: "${layout.containerWidth || "100%"}", margin: "0 auto" }}>\n`;

    const generateColumnsCode = (columns = [], indentLevel = 6, indices = { select: 0, input: 0, button: 0, modal: 0 }) => {
        if (!columns || columns.length === 0) {
            return `${" ".repeat(indentLevel)}<div className="flex flex-wrap"></div>`;
        }

        const indent = " ".repeat(indentLevel);
        let columnsCode = "";

        columns.forEach((column) => {
            if (!column) return;

            const orientation = column.orientation || "horizontal";
            const columnWidthClass = getColumnWidthClass(column.width);
            const flexDirection = orientation === "horizontal" ? "row" : "column";
            const flexLayout = column.flexLayout || "items-start justify-start";
            const flexGap = column.gap || "0";

            const itemsMatch = flexLayout.match(/items-([a-z-]+)/);
            const justifyMatch = flexLayout.match(/justify-([a-z-]+)/);
            const itemsValue = itemsMatch ? itemsMatch[1] : "start";
            const justifyValue = justifyMatch ? justifyMatch[1] : "start";

            const alignItems = convertAlignItems(itemsValue);
            const justifyContent = convertJustifyContent(justifyValue);
            const gap = `${flexGap}rem`;

            columnsCode += `${indent}<div className="${columnWidthClass} p-2">\n`;
            columnsCode += `${indent}  <div style={{ display: "flex", flexDirection: "${flexDirection}", alignItems: "${alignItems}", justifyContent: "${justifyContent}", gap: "${gap}", padding: "1rem" }}>\n`;

            if (column.components && column.components.length > 0) {
                column.components.forEach((component) => {
                    if (!component) return;
                    columnsCode += `${indent}    ${renderComponent(component, indices)}\n`;
                });
            }

            if (column.childColumns && column.childColumns.length > 0) {
                columnsCode += `${indent}    ${generateColumnsCode(column.childColumns, indentLevel + 4, indices)}\n`;
            }

            columnsCode += `${indent}  </div>\n`;
            columnsCode += `${indent}</div>\n`;
        });

        return columnsCode.trim();
    };

    code += generateColumnsCode(layout.columns, 6, { select: 0, input: 0, button: 0, modal: 0 });
    code += `\n    </div>`;
    return code;
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
    };
    return widthMap[width] || "w-full";
}

function convertAlignItems(value) {
    const alignMap = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        stretch: "stretch",
    };
    return alignMap[value] || "flex-start";
}

function convertJustifyContent(value) {
    const justifyMap = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        between: "space-between",
        around: "space-around",
        evenly: "space-evenly",
    };
    return justifyMap[value] || "flex-start";
}

function renderComponent(component, indices) {
    if (!component) return "";

    const { type, props = {} } = component;

    switch (type) {
        case "button":
            const buttonIndex = indices.button++;
            return `<button className="px-4 py-2 rounded-md ${getButtonVariantClass(props.variant)}" onClick={handleButtonClick${buttonIndex}} ${renderProps(props)}>${props.text || "Button"}</button>`;
        case "input":
            const inputIndex = indices.input++;
            return `<input type="${props.type || "text"}" placeholder="${props.placeholder || "Enter text..."}" value={inputValue${inputIndex}} onChange={(e) => setInputValue${inputIndex}(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md" ${renderProps(props)} />`;
        case "text":
            const Element = props.element || "p";
            return `<${Element} style={{ fontWeight: "${getFontWeight(props.fontWeight)}", textAlign: "${props.textAlign || "left"}", fontSize: "${props.fontSize || (Element === "p" ? "1rem" : "")}" }} ${renderProps(props)}>${props.text || (Element === "p" ? "Paragraph text" : `${Element.toUpperCase()} Heading`)}</${Element}>`;
        case "image":
            return `<img src="${props.src || "https://via.placeholder.com/300x200"}" alt="${props.alt || "Image"}" style={{ width: "${props.width || "100%"}", height: "${props.height || "auto"}" }} ${renderProps(props)} />`;
        case "div":
            return `<div style={{ backgroundColor: "${props.backgroundColor || "transparent"}", padding: "${props.padding || "1rem"}", borderRadius: "${props.borderRadius || "0.25rem"}", border: "${props.border || "none"}", minHeight: "50px" }} ${renderProps(props)}>${props.text || "Div Container"}</div>`;
        case "select":
            const selectIndex = indices.select++;
            return `<div className="relative">
                <select className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md bg-white" value={selectedValue${selectIndex}} onChange={(e) => setSelectedValue${selectIndex}(e.target.value)} ${renderProps(props)}>
                    <option value="" disabled>${props.placeholder || "Select an option"}</option>
                    ${(props.options || [
                    { value: "option1", label: "Option 1" },
                    { value: "option2", label: "Option 2" },
                    { value: "option3", label: "Option 3" },
                ])
                    .map((option) => `<option value="${option.value}">${option.label}</option>`)
                    .join("\n                    ")}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>`;
        case "card":
            return `<div className="rounded-lg border border-gray-200 shadow-md overflow-hidden" ${renderProps(props)}>
                ${props.imagePosition !== "bottom" && props.showImage ? `<div className="h-48 w-full bg-gray-200 relative"><img src="${props.imageSrc || "https://via.placeholder.com/400x200"}" alt="${props.imageAlt || "Card image"}" className="w-full h-full object-cover" /></div>` : ""}
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">${props.title || "Card Title"}</h3>
                    <p className="text-gray-600">${props.text || "Card content goes here."}</p>
                    ${props.showButton ? `<button className="mt-4 px-4 py-2 rounded-md ${getButtonVariantClass(props.buttonVariant)}">${props.buttonText || "Read More"}</button>` : ""}
                </div>
                ${props.imagePosition === "bottom" && props.showImage ? `<div className="h-48 w-full bg-gray-200 relative"><img src="${props.imageSrc || "https://via.placeholder.com/400x200"}" alt="${props.imageAlt || "Card image"}" className="w-full h-full object-cover" /></div>` : ""}
            </div>`;
        case "modal":
            const modalIndex = indices.modal++;
            return `<>
  <button onClick={handleModalToggle${modalIndex}} className="px-4 py-2 bg-blue-500 text-white rounded-md">
    ${props.triggerText || "Open Modal"}
  </button>
  <div>
    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleModalToggle${modalIndex}}></div>
    <div className="bg-white rounded-lg shadow-xl z-10 w-11/12 md:w-3/4 lg:w-1/2 max-h-screen overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">${props.title || "Modal Title"}</h3>
        <button onClick={handleModalToggle${modalIndex}} className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4">${props.content || "Modal content goes here"}</div>
      <div className="flex justify-end p-4 border-t">
        <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300" onClick={handleModalToggle${modalIndex}}>
          ${props.cancelText || "Cancel"}
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600" onClick={() => console.log("Confirm clicked")}>
          ${props.confirmText || "Confirm"}
        </button>
      </div>
    </div>
  </div>
</>`;
        default:
            return `<div>Unknown component: ${type}</div>`;
    }
}

function getButtonVariantClass(variant) {
    switch (variant) {
        case "default": return "bg-blue-500 text-white hover:bg-blue-600";
        case "destructive": return "bg-red-500 text-white hover:bg-red-600";
        case "outline": return "border border-gray-300 bg-transparent hover:bg-gray-50";
        case "secondary": return "bg-gray-200 text-gray-800 hover:bg-gray-300";
        case "ghost": return "bg-transparent hover:bg-gray-100";
        case "success": return "bg-green-500 text-white hover:bg-green-600";
        case "warning": return "bg-yellow-500 text-white hover:bg-yellow-600";
        default: return "bg-blue-500 text-white hover:bg-blue-600";
    }
}

function getFontWeight(weight) {
    const weightMap = {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
    };
    return weightMap[weight] || "400";
}

function renderProps(props = {}) {
    let propsString = "";
    if (props.className) {
        propsString += ` className="${props.className}"`;
    }
    Object.entries(props).forEach(([key, value]) => {
        if (key !== "className" && key !== "text" && key !== "options" && key !== "placeholder" && key !== "variant" && key !== "showImage" && key !== "imagePosition" && key !== "imageSrc" && key !== "imageAlt" && key !== "buttonText" && key !== "buttonVariant" && key !== "title" && key !== "content" && key !== "cancelText" && key !== "confirmText" && key !== "isOpen" && key !== "triggerText") {
            propsString += ` ${key}="${value}"`;
        }
    });
    return propsString;
}

export { generateReactCode };