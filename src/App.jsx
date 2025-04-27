import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import UIBuilder from "./components/UIBuilder";
import "./index.css";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <UIBuilder />
      </div>
    </DndProvider>
  );
}

export default App;
