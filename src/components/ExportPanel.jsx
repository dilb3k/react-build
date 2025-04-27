import React, { useState } from 'react';
import generateReactCode from '../utils/CodeGenerator';
import generateVueCode from '../utils/VueCodeGenerator';

const ExportPanel = ({ layout }) => {
    const [exportType, setExportType] = useState('react');
    const [copied, setCopied] = useState(false);

    const getGeneratedCode = () => {
        if (exportType === 'react') {
            return generateReactCode(layout);
        } else if (exportType === 'vue') {
            return generateVueCode(layout);
        }
        return '';
    };

    const handleCopyCode = () => {
        const code = getGeneratedCode();
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownloadCode = () => {
        const code = getGeneratedCode();
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportType === 'react' ? 'component.jsx' : 'component.vue';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="export-panel">
            <div className="export-header">
                <h3>Export Code</h3>
                <div className="export-options">
                    <label>
                        <input
                            type="radio"
                            name="exportType"
                            value="react"
                            checked={exportType === 'react'}
                            onChange={() => setExportType('react')}
                        />
                        React
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="exportType"
                            value="vue"
                            checked={exportType === 'vue'}
                            onChange={() => setExportType('vue')}
                        />
                        Vue
                    </label>
                </div>
            </div>

            <div className="code-preview-container">
                <pre className="code-preview">
                    <code>{getGeneratedCode()}</code>
                </pre>
            </div>

            <div className="export-actions">
                <button
                    className="copy-button"
                    onClick={handleCopyCode}
                >
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                    className="download-button"
                    onClick={handleDownloadCode}
                >
                    Download
                </button>
            </div>
        </div>
    );
};

export default ExportPanel;
