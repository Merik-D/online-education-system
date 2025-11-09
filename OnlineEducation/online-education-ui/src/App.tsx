import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<div>Зараз тут Головна Сторінка</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;