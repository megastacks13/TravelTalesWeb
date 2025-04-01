
import './App.css';
import {Routes,Route,Link, useNavigate} from 'react-router-dom'
import AnadirViajesComponent from './Components/AnadirViajesComponent.jsx';
import { useEffect, useState } from 'react';
import LoginUserComponent from './Components/LoginUserComponent';
import RegisterUserComponent from './Components/RegisterUserComponent';
import MenuInicioComponent from './Components/MenuInicioComponent';
import InicioComponent from './Components/InicioComponent';

import NavBarComponent from './Components/NavBarComponent.jsx';
import ViajesUsuarioComponent from './Components/ViajesUsuarioComponent.jsx';
import ViajeComponent from './Components/ViajeComponent.jsx';

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

  let checkIfLogin = () =>{
    if(localStorage.getItem("apiKey")!=null){
      setLogin(true)
    }else{
      setLogin(false)
    }
  }

  let disconnect = () =>{
    localStorage.removeItem("apiKey")
    setLogin(false)
    navigate("/")
  }

  return (
    
    <div className="App">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous"></link>
      {login && <NavBarComponent disconnect={disconnect}/>}
  
      {notification!="" && (
        <div className='notification'>      {notification}
          <span className='close-btn' onClick={()=>{setNotification("")}}>X</span>
        </div>
      )}
      <Routes>
        <Route path="/" element={<MenuInicioComponent/>}></Route>
        <Route path="/inicio" element={<InicioComponent login={login}/>}></Route>
        <Route path="/register" element={<RegisterUserComponent createNotification={createNotification}/>}></Route>
        <Route path="/login" element={<LoginUserComponent setLogin={setLogin}/>}></Route>
        <Route path="/viajes/anadir" element={<AnadirViajesComponent createNotification={createNotification}/>}></Route>
        <Route path="/viajes/buscar" element={<ViajesUsuarioComponent/>}></Route>
        <Route path="/viajes/:id" element={<ViajeComponent/>}></Route>
      </Routes>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    </div>
    
  );
}

export default App;
