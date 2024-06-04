import { useEffect, useState, useRef } from 'react';
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import Main from './components/main';
import New from './components/new';
import Hello from './components/hello';
import DeletePage from './components/delete';
import Login from './components/login';
import Dashboard from './components/dashboard';
import ViewPage from './components/view';
import Temp from './components/temp';
import Root from './components/root';
import './App.css';
function App() {

  return (
      <Routes>
        <Route element={<Main />} path={'/'}></Route>
        <Route element={<New />} path={'/new'}></Route>
        <Route element={<Hello />} path={'/hello'}></Route>
        <Route element={<DeletePage />} path={'/delete'}></Route>
        <Route element={<Login />} path={'/login'}></Route>
        <Route element={<Dashboard />} path={'/dashboard'}></Route>
        <Route element={<ViewPage />} path={'/view'}></Route>
        <Route element={<Temp />} path={'/temp'}></Route>
        <Route element={<Root />} path={'/root'}></Route>
      </Routes>
  );
}

export default App;
