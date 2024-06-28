import { useEffect, useState, useRef } from 'react';
import { Route, Routes, HashRouter as Router } from "react-router-dom";
import Main from './pages/main';
import New from './pages/new';
import Hello from './pages/hello';
import DeletePage from './pages/delete';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import ViewPage from './pages/view';
import Temp from './pages/temp';
import Root from './pages/root';
import UserManage from './pages/usermanage';
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
        <Route element={<UserManage />} path={'/usermanage'}></Route>
      </Routes>
  );
}

export default App;
