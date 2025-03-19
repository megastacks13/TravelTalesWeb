import './App.css';
import {Routes,Route,Link, useNavigate} from 'react-router-dom'
import AnadirViajeComponent from './Components/AnadirViajeComponent';

import { useEffect, useState } from 'react';

function App() {

  let [notification,setNotification]=useState("")
  let [login,setLogin]=useState(false)
  let navigate = useNavigate()

  let createNotification = (msg) =>{
    setNotification(msg)
    setTimeout(()=>{
      setNotification("")
    },3000)

  }

  useEffect(()=>{
    checkIfLogin()
  },
  [])


  return (
    <div className="App">
      <nav>
        <ul>
          {<li><Link to="/anadirViaje">Añadir Viaje</Link></li>}
        </ul>
      </nav>
      {notification!="" && (
        <div className='notification'>      {notification}
          <span className='close-btn' onClick={()=>{setNotification("")}}>X</span>
        </div>
      )}
      <h1>My gifts</h1>
      <Routes>
        <Route path="/anadirViaje" element={<AnadirViajeComponent createNotification={createNotification}/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
