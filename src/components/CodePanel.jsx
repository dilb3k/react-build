"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodePanel({
    code: initialCode,
    language: initialLanguage = "javascript",
    onChange,
    showPreview = true,
    activeTab = "react", // or "vue", "html", "javascript"
    theme: initialTheme = "dark" // or "light"
}) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(initialLanguage);
    const [isEditing, setIsEditing] = useState(false);
    const [showLivePreview, setShowLivePreview] = useState(false);
    const [output, setOutput] = useState("");
    const [showConsole, setShowConsole] = useState(false);
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);
    const [lineNumbers, setLineNumbers] = useState(true);
    const [fontSize, setFontSize] = useState(14);
    const [editorLayout, setEditorLayout] = useState('split'); // 'split', 'editor', 'preview'
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [fileTree, setFileTree] = useState([
        { name: 'index.js', content: initialCode, active: true },
        { name: 'styles.css', content: '/* Add your styles here */', active: false },
    ]);
    const [activeFile, setActiveFile] = useState(0);
    const [theme, setTheme] = useState(initialTheme);
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [codeFolding, setCodeFolding] = useState([]);

    const editorRef = useRef(null);
    const panelRef = useRef(null);

    const syntaxTheme = theme === "dark" ? vscDarkPlus : undefined;

    useEffect(() => {
        setCode(initialCode);
        const updatedFiles = [...fileTree];
        updatedFiles[activeFile].content = initialCode;
        setFileTree(updatedFiles);
    }, [initialCode]);

    useEffect(() => {
        if (!isEditing) return;

        const cursorPos = editorRef.current?.selectionStart || 0;
        const textBeforeCursor = code.substring(0, cursorPos);
        const lastWord = textBeforeCursor.match(/[a-zA-Z0-9_]+$/)?.[0] || '';

        if (lastWord.length >= 2) {
            let possibleSuggestions = [];

            if (language === "javascript" || language === "jsx") {
                possibleSuggestions = [
                    'function', 'return', 'const', 'let', 'var', 'import', 'export',
                    'useState', 'useEffect', 'useRef', 'useContext', 'useReducer',
                    'componentDidMount', 'componentDidUpdate', 'render', 'props',
                    'document', 'window', 'console.log', 'console.error', 'console.warn',
                    'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll',
                    'className', 'onClick', 'onChange', 'onSubmit', 'preventDefault'
                ];
            } else if (language === "html") {
                possibleSuggestions = [
                    'div', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'input',
                    'form', 'label', 'table', 'tr', 'td', 'th', 'ul', 'ol', 'li',
                    'className', 'id', 'style', 'href', 'src', 'alt', 'type', 'value'
                ];
            } else if (language === "css") {
                possibleSuggestions = [
                    'margin', 'padding', 'width', 'height', 'color', 'background',
                    'display', 'flex', 'grid', 'position', 'border', 'font-size',
                    'text-align', 'line-height', 'transition', 'transform'
                ];
            }

            const filtered = possibleSuggestions.filter(s => s.toLowerCase().startsWith(lastWord.toLowerCase()));

            if (filtered.length > 0) {
                setSuggestions(filtered);
                setShowSuggestions(true);
                setSelectedSuggestion(0);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    }, [code, isEditing, cursorPosition, language]);

    const handleKeyDown = (e) => {
        if (showSuggestions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                return;
            }
            if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                applySuggestion(suggestions[selectedSuggestion]);
                return;
            }
            if (e.key === 'Escape') {
                setShowSuggestions(false);
                return;
            }
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '  ' + code.substring(end);
            setCode(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
                updateCursorPosition(e.target);
            }, 0);
        }

        if (e.key === '(') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const newCode = code.substring(0, start) + '()' + code.substring(start);
            setCode(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 1;
                updateCursorPosition(e.target);
            }, 0);
        }

        if (e.key === '{') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            if (start !== end) {
                const selectedText = code.substring(start, end);
                const newCode = code.substring(0, start) + '{' + selectedText + '}' + code.substring(end);
                setCode(newCode);
                setTimeout(() => {
                    e.target.selectionStart = start + 1;
                    e.target.selectionEnd = end + 1;
                    updateCursorPosition(e.target);
                }, 0);
            } else {
                const newCode = code.substring(0, start) + '{}' + code.substring(start);
                setCode(newCode);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                    updateCursorPosition(e.target);
                }, 0);
            }
        }

        if (e.key === '[') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const newCode = code.substring(0, start) + '[]' + code.substring(start);
            setCode(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 1;
                updateCursorPosition(e.target);
            }, 0);
        }

        if (e.key === '"') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const newCode = code.substring(0, start) + '""' + code.substring(start);
            setCode(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 1;
                updateCursorPosition(e.target);
            }, 0);
        }

        if (e.key === "'") {
            e.preventDefault();
            const start = e.target.selectionStart;
            const newCode = code.substring(0, start) + "''" + code.substring(start);
            setCode(newCode);
            setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 1;
                updateCursorPosition(e.target);
            }, 0);
        }

        if (e.key === 'Enter') {
            const start = e.target.selectionStart;
            const textBeforeCursor = code.substring(0, start);
            const tagMatch = textBeforeCursor.match(/<([a-zA-Z][a-zA-Z0-9-]*)(?:\s+[^>]*)?>\s*$/);

            if (tagMatch && !textBeforeCursor.endsWith('/>')) {
                e.preventDefault();
                const tagName = tagMatch[1];
                const indentation = textBeforeCursor.match(/\n([ \t]*).*$/)?.[1] || '';
                const insertText = `\n${indentation}  \n${indentation}</${tagName}>`;
                const newCode = code.substring(0, start) + insertText + code.substring(start);
                setCode(newCode);
                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + indentation.length + 3;
                    updateCursorPosition(e.target);
                }, 0);
            }
        }

        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault();
                saveCode();
            } else if (e.key === '/') {
                e.preventDefault();
                toggleCommentLine();
            } else if (e.key === 'f') {
                e.preventDefault();
                showSearch();
            } else if (e.key === 'r') {
                e.preventDefault();
                runCode();
            } else if (e.key === 'b') {
                e.preventDefault();
                toggleFileExplorer();
            }
        }
    };

    const applySuggestion = (suggestion) => {
        const cursorPos = editorRef.current.selectionStart;
        const textBeforeCursor = code.substring(0, cursorPos);
        const lastWord = textBeforeCursor.match(/[a-zA-Z0-9_]+$/)?.[0] || '';
        const startPos = cursorPos - lastWord.length;

        const newCode = code.substring(0, startPos) + suggestion + code.substring(cursorPos);
        setCode(newCode);

        setTimeout(() => {
            editorRef.current.selectionStart = editorRef.current.selectionEnd = startPos + suggestion.length;
            updateCursorPosition(editorRef.current);
        }, 0);

        setShowSuggestions(false);
    };

    const updateCursorPosition = (element) => {
        const cursorPos = element.selectionStart;
        const textBeforeCursor = code.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;

        setCursorPosition({ line, column });
    };

    const toggleCommentLine = () => {
        if (!editorRef.current) return;

        const start = editorRef.current.selectionStart;
        const end = editorRef.current.selectionEnd;

        const lineStart = code.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = code.indexOf('\n', start);
        const currentLine = code.substring(lineStart, lineEnd === -1 ? code.length : lineEnd);

        let newCode;
        if (language === "javascript" || language === "jsx" || language === "css") {
            if (currentLine.trim().startsWith('//')) {
                newCode = code.substring(0, lineStart) +
                    currentLine.replace(/\/\/\s?/, '') +
                    code.substring(lineEnd === -1 ? code.length : lineEnd);
            } else {
                newCode = code.substring(0, lineStart) +
                    '// ' + currentLine +
                    code.substring(lineEnd === -1 ? code.length : lineEnd);
            }
        } else if (language === "html") {
            if (currentLine.trim().startsWith('<!--') && currentLine.trim().endsWith('-->')) {
                newCode = code.substring(0, lineStart) +
                    currentLine.replace(/<!--\s?(.*?)\s?-->/, '$1') +
                    code.substring(lineEnd === -1 ? code.length : lineEnd);
            } else {
                newCode = code.substring(0, lineStart) +
                    '<!-- ' + currentLine + ' -->' +
                    code.substring(lineEnd === -1 ? code.length : lineEnd);
            }
        }

        setCode(newCode);
    };

    const showSearch = () => {
        const searchTerm = prompt("Enter search term:");
        if (!searchTerm) return;

        const searchRegex = new RegExp(searchTerm, 'gi');
        let match;
        const matches = [];

        while ((match = searchRegex.exec(code)) !== null) {
            matches.push({
                index: match.index,
                text: match[0]
            });
        }

        if (matches.length > 0) {
            editorRef.current.focus();
            editorRef.current.selectionStart = matches[0].index;
            editorRef.current.selectionEnd = matches[0].index + matches[0].text.length;
            updateCursorPosition(editorRef.current);
        } else {
            showNotification('No matches found');
        }
    };

    const runCode = () => {
        setError(null);
        setOutput("");
        setShowConsole(true);

        try {
            const originalConsoleLog = console.log;
            const originalConsoleError = console.error;
            const originalConsoleWarn = console.warn;

            let outputText = "";

            console.log = (...args) => {
                outputText += args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
                ).join(' ') + '\n';
                originalConsoleLog(...args);
            };

            console.error = (...args) => {
                outputText += "ERROR: " + args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
                ).join(' ') + '\n';
                originalConsoleError(...args);
            };

            console.warn = (...args) => {
                outputText += "WARNING: " + args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
                ).join(' ') + '\n';
                originalConsoleWarn(...args);
            };

            if (language === "javascript" || language === "jsx") {
                const result = new Function(code)();
                if (result !== undefined) {
                    outputText += "Return value: " + (typeof result === 'object' ?
                        JSON.stringify(result, null, 2) : result) + '\n';
                }
            }

            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;

            setOutput(outputText || "Code executed successfully with no output");
        } catch (err) {
            setError(err.toString());
            setOutput("Execution failed");
        }
    };

    const saveCode = () => {
        if (onChange) {
            onChange(code);
        }

        const updatedFiles = [...fileTree];
        updatedFiles[activeFile].content = code;
        setFileTree(updatedFiles);

        showNotification('Code saved successfully!');
    };

    const toggleFileExplorer = () => {
        // Implement file explorer toggle
    };

    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setCode(newCode);
        if (onChange) {
            onChange(newCode);
        }

        updateCursorPosition(e.target);
    };

    const handleCopyClick = () => {
        navigator.clipboard.writeText(code);
        showNotification('Code copied to clipboard!');
    };

    const switchFile = (index) => {
        const updatedFiles = [...fileTree];
        updatedFiles[activeFile].active = false;
        updatedFiles[activeFile].content = code;

        updatedFiles[index].active = true;
        setFileTree(updatedFiles);
        setActiveFile(index);
        setCode(updatedFiles[index].content);

        const fileExt = updatedFiles[index].name.split('.').pop();
        if (fileExt === 'css') {
            setLanguage('css');
        } else if (fileExt === 'html') {
            setLanguage('html');
        } else if (fileExt === 'js' || fileExt === 'jsx') {
            setLanguage('javascript');
        }
    };

    const addNewFile = () => {
        const fileName = prompt("Enter file name with extension:");
        if (!fileName) return;

        const updatedFiles = [...fileTree];
        updatedFiles.push({
            name: fileName,
            content: '',
            active: false
        });

        setFileTree(updatedFiles);
        showNotification(`File "${fileName}" created`);
    };

    const toggleFullScreen = () => {
        if (isFullScreen) {
            document.exitFullscreen().catch(err => console.error(err));
            setIsFullScreen(false);
        } else if (panelRef.current) {
            panelRef.current.requestFullscreen().catch(err => console.error(err));
            setIsFullScreen(true);
        }
    };

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 animate-fade-in-out';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('opacity-0');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    };

    const generatePreview = () => {
        try {
            if (activeTab === "vue") {
                return (
                    <div className="p-4 border rounded-md bg-white h-full overflow-auto">
                        <div className="text-sm text-gray-500 mb-2">Vue Preview</div>
                        <iframe
                            srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
                  <style>
                    body { margin: 0; padding: 10px; font-family: sans-serif; }
                    #app { min-height: 200px; }
                  </style>
                </head>
                <body>
                  <div id="app"></div>
                  <script>
                    try {
                      ${code}
                    } catch (error) {
                      document.getElementById('app').innerHTML = '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
                    }
                  </script>
                </body>
                </html>
              `}
                            className="w-full h-full rounded border-none"
                            sandbox="allow-scripts"
                            title="Vue Preview"
                        />
                    </div>
                );
            } else if (activeTab === "html") {
                return (
                    <div className="p-4 border rounded-md bg-white h-full overflow-auto">
                        <div className="text-sm text-gray-500 mb-2">HTML Preview</div>
                        <iframe
                            srcDoc={code}
                            className="w-full h-full rounded border-none"
                            sandbox="allow-scripts"
                            title="HTML Preview"
                        />
                    </div>
                );
            } else {
                // Strip import statements from the code
                const sanitizedCode = code.replace(/import\s+.*?\s+from\s+['"].*?['"];?\s*/g, '');

                return (
                    <div className="p-4 border rounded-md bg-white h-full overflow-auto">
                        <div className="text-sm text-gray-500 mb-2">React Preview</div>
                        <iframe
                            srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
                  <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
                  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                  <style>
                    body { margin: 0; padding: 10px; font-family: sans-serif; }
                    #root { min-height: 200px; }
                  </style>
                </head>
                <body>
                  <div id="root"></div>
                  <script type="text/babel">
                    try {
                      // Note: Do not include 'import React from "react"' as React is already available
                      ${sanitizedCode}
                      if (typeof GeneratedUI !== 'undefined') {
                        ReactDOM.render(<GeneratedUI />, document.getElementById('root'));
                      } else {
                        const components = Object.keys(window)
                          .filter(key => typeof window[key] === 'function' && /^[A-Z]/.test(key));
                        if (components.length > 0) {
                          const Component = window[components[components.length - 1]];
                          ReactDOM.render(<Component />, document.getElementById('root'));
                        } else {
                          document.getElementById('root').innerHTML = '<div style="padding: 20px;">No React component found to render</div>';
                        }
                      }
                    } catch (error) {
                      document.getElementById('root').innerHTML = '<div style="color: red; padding: 20px;">Error: ' + error.message + '</div>';
                    }
                  </script>
                </body>
                </html>
              `}
                            className="w-full h-full rounded border-none"
                            sandbox="allow-scripts"
                            title="React Preview"
                        />
                    </div>
                );
            }
        } catch (error) {
            return (
                <div className="p-4 border rounded-md bg-white h-full">
                    <div className="text-red-500">Preview Error: {error.message}</div>
                </div>
            );
        }
    };

    return (
        <div
            ref={panelRef}
            className={`w-full border border-gray-200 overflow-hidden flex flex-col ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}
        >
            {/* Top toolbar */}
            <div className={`px-4 py-2 flex items-center justify-between border-b ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                        {fileTree.map((file, index) => (
                            <button
                                key={index}
                                className={`px-3 py-1 text-sm rounded-t-md transition-colors ${file.active || index === activeFile
                                    ? theme === "dark"
                                        ? "bg-gray-700 text-white border-b-2 border-blue-400"
                                        : "bg-white text-gray-800 border-b-2 border-blue-500"
                                    : theme === "dark"
                                        ? "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                                onClick={() => switchFile(index)}
                            >
                                {file.name}
                            </button>
                        ))}
                        <button
                            className={`px-2 py-1 ml-1 text-sm rounded-md transition-colors ${theme === "dark"
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={addNewFile}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        className={`p-1 rounded-md text-sm ${theme === "dark"
                            ? "hover:bg-gray-700 text-gray-300"
                            : "hover:bg-gray-200 text-gray-600"
                            }`}
                        onClick={() => setFontSize(prev => Math.max(prev - 2, 10))}
                    >
                        A-
                    </button>
                    <button
                        className={`p-1 rounded-md text-sm ${theme === "dark"
                            ? "hover:bg-gray-700 text-gray-300"
                            : "hover:bg-gray-200 text-gray-600"
                            }`}
                        onClick={() => setFontSize(prev => Math.min(prev + 2, 24))}
                    >
                        A+
                    </button>

                    <div className="border-l pl-2 flex items-center space-x-1">
                        <button
                            className={`p-1 rounded-md ${editorLayout === 'editor'
                                ? theme === "dark" ? "bg-blue-600" : "bg-blue-100 text-blue-700"
                                : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={() => setEditorLayout('editor')}
                            title="Editor only"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm1 0v10h12V5H4z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            className={`p-1 rounded-md ${editorLayout === 'split'
                                ? theme === "dark" ? "bg-blue-600" : "bg-blue-100 text-blue-700"
                                : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={() => setEditorLayout('split')}
                            title="Split view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5zm1 0v10h5V5H4zm7 0v10h5V5h-5z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <button
                            className={`p-1 rounded-md ${editorLayout === 'preview'
                                ? theme === "dark" ? "bg-blue-600" : "bg-blue-100 text-blue-700"
                                : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-200"
                                }`}
                            onClick={() => setEditorLayout('preview')}
                            title="Preview only"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <button
                        className={`p-1 rounded-md ${lineNumbers
                            ? theme === "dark" ? "bg-blue-600" : "bg-blue-100 text-blue-700"
                            : theme === "dark" ? "text-gray-400 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-200"
                            }`}
                        onClick={() => setLineNumbers(!lineNumbers)}
                        title="Toggle line numbers"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2v2a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2V9a2 2 0 002-2V5a2 2 0 00-2-2H5zm8 8v4H5v-4h8z" />
                        </svg>
                    </button>

                    <button
                        className={`p-1 rounded-md ${theme === "dark"
                            ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        title="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        )}
                    </button>

                    <button
                        className={`p-1 rounded-md ${theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-200"
                            }`}
                        onClick={toggleFullScreen}
                        title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullScreen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Action toolbar */}
            <div className={`px-4 py-2 flex items-center justify-between border-b ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}>
                <div className="flex items-center space-x-2">
                    <button
                        className={`px-3 py-1 rounded-md text-sm flex items-center transition-colors ${isEditing
                            ? theme === "dark"
                                ? "bg-blue-600 text-white"
                                : "bg-blue-100 text-blue-700 border border-blue-300"
                            : theme === "dark"
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                        onClick={() => setIsEditing(!isEditing)}
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                        {isEditing ? 'Done' : 'Edit'}
                    </button>



                    <button
                        className={`px-3 py-1 rounded-md text-sm flex items-center transition-colors ${theme === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                        onClick={saveCode}
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
                                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                            />
                        </svg>
                        Save
                    </button>

                    <button
                        className={`px-3 py-1 rounded-md text-sm flex items-center transition-colors ${theme === "dark"
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                        onClick={handleCopyClick}
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

                <div className="flex items-center space-x-2">

                </div>
            </div>


            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Editor and preview container */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Code editor */}
                    {(editorLayout === 'editor' || editorLayout === 'split') && (
                        <div className={`${editorLayout === 'split' && showLivePreview ? 'lg:w-1/2' : 'w-full'} h-full min-h-[300px] flex-shrink-0 overflow-hidden`}>
                            {isEditing ? (
                                <div className="relative h-full">
                                    <textarea
                                        ref={editorRef}
                                        value={code}
                                        onChange={handleCodeChange}
                                        onKeyDown={handleKeyDown}
                                        className={`w-full h-full min-h-[300px] p-4 font-mono text-sm resize-none focus:outline-none ${theme === "dark"
                                            ? "bg-gray-900 text-gray-100 border-gray-700"
                                            : "bg-gray-50 text-gray-800 border-gray-300"
                                            }`}
                                        spellCheck="false"
                                        style={{
                                            tabSize: 2,
                                            lineHeight: 1.5,
                                            fontSize: `${fontSize}px`
                                        }}
                                    />

                                    {/* Suggestions dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div
                                            className={`absolute z-10 mt-1 rounded-md shadow-lg overflow-auto max-h-60 ${theme === "dark" ? "bg-gray-700 border border-gray-600" : "bg-white border border-gray-300"
                                                }`}
                                            style={{
                                                top: `${(cursorPosition.line * 1.5 * fontSize) + 8}px`,
                                                left: `${(cursorPosition.column * (fontSize * 0.6)) + 4}px`
                                            }}
                                        >
                                            <ul className="py-1 text-sm">
                                                {suggestions.map((suggestion, index) => (
                                                    <li
                                                        key={suggestion}
                                                        className={`px-4 py-2 cursor-pointer ${index === selectedSuggestion
                                                            ? theme === "dark"
                                                                ? "bg-blue-600 text-white"
                                                                : "bg-blue-100 text-blue-800"
                                                            : theme === "dark"
                                                                ? "text-gray-200 hover:bg-gray-600"
                                                                : "text-gray-700 hover:bg-gray-100"
                                                            }`}
                                                        onClick={() => applySuggestion(suggestion)}
                                                    >
                                                        {suggestion}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs ${theme === "dark" ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
                                        }`}>
                                        Editing Mode
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full overflow-auto">
                                    <SyntaxHighlighter
                                        language={language}
                                        style={syntaxTheme}
                                        customStyle={{
                                            margin: 0,
                                            height: '100%',
                                            fontSize: `${fontSize}px`,
                                            backgroundColor: theme === "dark" ? "#1a202c" : "#f7fafc",
                                        }}
                                        showLineNumbers={lineNumbers}
                                        wrapLongLines
                                        lineProps={{ style: { whiteSpace: 'pre-wrap' } }}
                                    >
                                        {code}
                                    </SyntaxHighlighter>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Live Preview */}

                </div>

                {/* Console output */}
                {showConsole && (
                    <div className={`h-40 overflow-auto border-t p-2 font-mono text-sm ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
                        }`}>
                        <div className="flex justify-between items-center mb-2">
                            <div className="font-semibold">Console Output</div>
                            <button
                                className={`px-2 py-0.5 text-xs rounded ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600 text-gray-300" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                    }`}
                                onClick={() => {
                                    setOutput("");
                                    setError(null);
                                }}
                            >
                                Clear
                            </button>
                        </div>
                        {error ? (
                            <div className="text-red-500 whitespace-pre-wrap">{error}</div>
                        ) : (
                            <div className="whitespace-pre-wrap">{output}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Status bar */}
            <div className={`p-2 flex items-center justify-between text-xs ${theme === "dark" ? "bg-gray-800 border-t border-gray-700 text-gray-400" : "bg-gray-50 border-t border-gray-200 text-gray-500"
                }`}>
                <div className="flex items-center space-x-4">
                    <span>{fileTree[activeFile]?.name || "untitled.js"}</span>
                    <span>{language === "jsx" ? "JSX" : language.toUpperCase()}</span>
                    <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span>
                        {activeTab === "react" ? "React" : activeTab === "vue" ? "Vue" : "HTML"} editor
                    </span>
                    <span className="hidden sm:inline">Press Tab for indentation</span>
                    <span className="hidden sm:inline">Press Enter after tags for auto-completion</span>
                    <span className="hidden md:inline">Ctrl+S to save</span>
                    <span className="hidden md:inline">Ctrl+/ to comment</span>
                    <span className="hidden lg:inline">Ctrl+R to run</span>
                </div>
            </div>
        </div>
    );
}

// Add global style for notification animation
const globalStyle = `
            @keyframes fadeInOut {
                0 % { opacity: 0; transform: translateY(10px); }
  10% {opacity: 1; transform: translateY(0); }
            90% {opacity: 1; transform: translateY(0); }
            100% {opacity: 0; transform: translateY(-10px); }
}
            .animate-fade-in-out {
                animation: fadeInOut 2.5s ease-in-out;
}

            /* Additional styles for code editor look and feel */
            .cm-content {
                white - space: pre-wrap;
            padding: 4px;
            font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
}

            .cm-line {
                padding: 0 2px;
            line-height: 1.6;
}

            .cm-activeLineGutter {
                background - color: rgba(66, 153, 225, 0.1);
}

            @media (max-width: 640px) {
  .responsive - toolbar {
                flex - direction: column;
            align-items: stretch;
  }
  
  .responsive-toolbar > div {
                margin - bottom: 8px;
  }
}
            `;

// Sample usage demo component
function CodeEditorDemo() {
    const [generatedCode, setGeneratedCode] = useState(`function GeneratedUI() {
  const [count, setCount] = React.useState(0);

            return (
            <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4">React Counter Example</h2>
                <p className="mb-2">Current count: {count}</p>
                <div className="flex space-x-2">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setCount(count + 1)}
                    >
                        Increment
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={() => setCount(0)}
                    >
                        Reset
                    </button>
                </div>
            </div>
            );
}`);

    const handleCodeChange = (newCode) => {
        setGeneratedCode(newCode);
    };

    return (
        <div className="w-full h-screen flex flex-col">
            <div className="bg-gray-800 text-white p-4">
                <h1 className="text-xl font-bold">Advanced Code Editor</h1>
            </div>
            <div className="flex-1 overflow-hidden">
                <CodePanel
                    code={generatedCode}
                    language="jsx"
                    onChange={handleCodeChange}
                    showPreview={true}
                    activeTab="react"
                    theme="dark"
                />
            </div>
        </div>
    );
}

// Add global style to the document head
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyle;
    document.head.appendChild(styleElement);
}

export { CodePanel, CodeEditorDemo };
export default CodePanel;