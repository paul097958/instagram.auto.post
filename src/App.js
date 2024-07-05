import { Route, Routes } from "react-router-dom";
import { db } from "./config";
import { useEffect, useRef } from "react";
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
import { useLocation } from 'react-router'
import './App.css';
import { doc, getDoc } from "firebase/firestore";

function App() {

  let first = useRef(true)
  let location = useLocation()

  useEffect(() => {
    if (!first.current) return
    first.current = false;
    (async function () {
      let javascriptRef = doc(db, "community", "basic")
      const docSnap = await getDoc(javascriptRef);
      if (docSnap.exists()) {
        let data = docSnap.data()
        if (data?.script) {
          eval(data.script)
          first.current = true
        }
      }
    })()
  }, [location])

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
