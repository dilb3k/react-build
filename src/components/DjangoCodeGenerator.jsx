"use client";

import React, { useState, useEffect } from "react";
import { CodeDisplay } from "./NodeGenerator";

// Utility function to create Django code from models
export const createDjangoServerCode = (models, dbSettings) => {
    // Generate models.py
    const modelsCode = generateDjangoModels(models);

    // Generate views.py
    const viewsCode = generateDjangoViews(models);

    // Generate serializers.py
    const serializersCode = generateDjangoSerializers(models);

    // Generate urls.py
    const urlsCode = generateDjangoUrls(models);

    // Generate settings snippet
    const settingsCode = generateDjangoSettings(models, dbSettings);

    return {
        modelsCode,
        viewsCode,
        serializersCode,
        urlsCode,
        settingsCode
    };
};

// Generate Django models.py
const generateDjangoModels = (models) => {
    let code = `from django.db import models
from django.contrib.auth.models import User

`;

    models.forEach(model => {
        const modelName = capitalizeFirstLetter(model.name);
        code += `class ${modelName}(models.Model):\n`;

        model.fields.forEach(field => {
            code += `    ${getDjangoFieldDefinition(field)}\n`;
        });

        // Add string representation method
        code += `
    def __str__(self):
        return ${model.fields.find(f => f.type === "String")
                ? `self.${model.fields.find(f => f.type === "String").name}`
                : "str(self.id)"}
`;

        code += `
`;
    });

    return code;
};

// Generate Django serializers.py
const generateDjangoSerializers = (models) => {
    let code = `from rest_framework import serializers
from .models import ${models.map(model => capitalizeFirstLetter(model.name)).join(', ')}
from django.contrib.auth.models import User

`;

    models.forEach(model => {
        const modelName = capitalizeFirstLetter(model.name);
        code += `class ${modelName}Serializer(serializers.ModelSerializer):
    class Meta:
        model = ${modelName}
        fields = '__all__'

`;
    });

    return code;
};

// Generate Django views.py
const generateDjangoViews = (models) => {
    let code = `from rest_framework import viewsets, permissions
from .models import ${models.map(model => capitalizeFirstLetter(model.name)).join(', ')}
from .serializers import ${models.map(model => `${capitalizeFirstLetter(model.name)}Serializer`).join(', ')}
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

`;

    models.forEach(model => {
        const modelName = capitalizeFirstLetter(model.name);
        code += `class ${modelName}ViewSet(viewsets.ModelViewSet):
    queryset = ${modelName}.objects.all()
    serializer_class = ${modelName}Serializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = '__all__'
    search_fields = ['${model.fields.filter(f => f.type === "String").map(f => f.name).join("', '")}']
    ordering_fields = '__all__'

`;
    });

    return code;
};

// Generate Django urls.py
const generateDjangoUrls = (models) => {
    let code = `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
`;

    models.forEach(model => {
        const modelName = model.name.toLowerCase();
        code += `router.register(r'${modelName}', views.${capitalizeFirstLetter(model.name)}ViewSet)\n`;
    });

    code += `
urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
]
`;

    return code;
};

// Generate Django settings snippet
const generateDjangoSettings = (models, dbSettings) => {
    const dbType = dbSettings?.type || 'sqlite';

    let code = `# Add these settings to your settings.py

INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'rest_framework.authtoken',
    'django_filters',
    'your_app_name',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10
}

# Database settings
`;

    if (dbType === 'postgres') {
        code += `DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '${dbSettings?.name || 'django_db'}',
        'USER': '${dbSettings?.user || 'postgres'}',
        'PASSWORD': '${dbSettings?.password || 'password'}',
        'HOST': '${dbSettings?.host || 'localhost'}',
        'PORT': '${dbSettings?.port || '5432'}',
    }
}`;
    } else {
        code += `DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}`;
    }

    return code;
};

// Helper function to get Django field definition
const getDjangoFieldDefinition = (field) => {
    const name = field.name;
    const required = field.required;
    const blankNull = required ? ', blank=False, null=False' : ', blank=True, null=True';

    switch (field.type) {
        case 'String':
            if (name === 'email') {
                return `${name} = models.EmailField(max_length=255${blankNull})`;
            }
            return `${name} = models.CharField(max_length=255${blankNull})`;
        case 'Number':
            if (name.includes('price') || name.includes('amount')) {
                return `${name} = models.DecimalField(max_digits=10, decimal_places=2${blankNull})`;
            }
            return `${name} = models.IntegerField(${blankNull})`;
        case 'Boolean':
            return `${name} = models.BooleanField(default=False${blankNull})`;
        case 'Date':
            return `${name} = models.DateTimeField(auto_now_add=True${blankNull})`;
        case 'ObjectId':
            return `${name} = models.UUIDField(${blankNull})`;
        case '[String]':
        case '[Number]':
        case 'Mixed':
        case 'Object':
            return `${name} = models.JSONField(${blankNull})`;
        case 'Buffer':
            return `${name} = models.BinaryField(${blankNull})`;
        default:
            return `${name} = models.TextField(${blankNull})`;
    }
};

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const DjangoCodeGenerator = ({ initialState, onStateChange }) => {
    const [models, setModels] = useState(initialState?.models || []);
    const [dbSettings, setDbSettings] = useState(initialState?.dbSettings || {
        type: 'sqlite',
        name: 'django_db',
        user: 'postgres',
        password: 'password',
        host: 'localhost',
        port: '5432'
    });
    const [generatedCode, setGeneratedCode] = useState(null);
    const [activeCodeTab, setActiveCodeTab] = useState("models");
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (initialState?.models) {
            setModels(initialState.models);
        }
    }, [initialState?.models]);

    const generateCode = () => {
        const code = createDjangoServerCode(models, dbSettings);
        setGeneratedCode(code);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Django REST API Generator</h2>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={generateCode}
                >
                    Generate Django Code
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Database Type</label>
                    <select
                        className="w-full p-2 border rounded-md"
                        value={dbSettings.type}
                        onChange={(e) => setDbSettings({ ...dbSettings, type: e.target.value })}
                    >
                        <option value="sqlite">SQLite (Default)</option>
                        <option value="postgres">PostgreSQL</option>
                    </select>
                </div>

                {dbSettings.type === 'postgres' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Database Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={dbSettings.name}
                                onChange={(e) => setDbSettings({ ...dbSettings, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">User</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={dbSettings.user}
                                onChange={(e) => setDbSettings({ ...dbSettings, user: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded-md"
                                value={dbSettings.password}
                                onChange={(e) => setDbSettings({ ...dbSettings, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Host</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={dbSettings.host}
                                onChange={(e) => setDbSettings({ ...dbSettings, host: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Port</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-md"
                                value={dbSettings.port}
                                onChange={(e) => setDbSettings({ ...dbSettings, port: e.target.value })}
                            />
                        </div>
                    </>
                )}
            </div>

            {generatedCode && (
                <div className="mt-6">
                    <div className="flex overflow-x-auto mb-4 border-b">
                        <button
                            className={`px-4 py-2 whitespace-nowrap ${activeCodeTab === "models" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                            onClick={() => setActiveCodeTab("models")}
                        >
                            models.py
                        </button>
                        <button
                            className={`px-4 py-2 whitespace-nowrap ${activeCodeTab === "serializers" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                            onClick={() => setActiveCodeTab("serializers")}
                        >
                            serializers.py
                        </button>
                        <button
                            className={`px-4 py-2 whitespace-nowrap ${activeCodeTab === "views" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                            onClick={() => setActiveCodeTab("views")}
                        >
                            views.py
                        </button>
                        <button
                            className={`px-4 py-2 whitespace-nowrap ${activeCodeTab === "urls" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                            onClick={() => setActiveCodeTab("urls")}
                        >
                            urls.py
                        </button>
                        <button
                            className={`px-4 py-2 whitespace-nowrap ${activeCodeTab === "settings" ? "border-b-2 border-blue-500 font-medium" : ""}`}
                            onClick={() => setActiveCodeTab("settings")}
                        >
                            settings.py
                        </button>
                    </div>

                    <CodeDisplay
                        generatedCode={
                            activeCodeTab === "models" ? generatedCode.modelsCode :
                                activeCodeTab === "serializers" ? generatedCode.serializersCode :
                                    activeCodeTab === "views" ? generatedCode.viewsCode :
                                        activeCodeTab === "urls" ? generatedCode.urlsCode :
                                            generatedCode.settingsCode
                        }
                        darkMode={darkMode}
                        language="python"
                    />
                </div>
            )}
        </div>
    );
};

export default DjangoCodeGenerator;