import React from 'react';
import Player from './components/Player/Player.jsx';
import Logout from './components/Logout/Logout.jsx';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
    <div>
      <Routes>
        <Route path='/' element={<Player />}/>
        <Route path='/logout' element={<Logout />} />
      </Routes>
    </div>
    </BrowserRouter>
  );
};

export default App;
