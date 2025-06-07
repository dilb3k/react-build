import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import "./index.css";
import UIBuilder from "./components/FrontendUIBuilder";
import BackendUIBuilder from "./components/BackendUiBuilder";
import NotFound from "./components/NotFound";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";

function App() {
  const [activeTab, setActiveTab] = useState('frontend');

  return (
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UIBuilder />} />
          <Route path="/backend" element={<BackendUIBuilder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DndProvider>
  );
}

export default App;