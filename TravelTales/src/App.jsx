import './App.css';
import {Routes,Route,Link, useNavigate} from 'react-router-dom'
import ViajesComponent from './Components/ViajesComponent';
import { useEffect, useState } from 'react';
import LoginUserComponent from './Components/LoginUserComponent';
import RegisterUserComponent from './Components/RegisterUserComponent'
import MenuPrincipalComponent from './Components/MenuPrincipalComponent';

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
      <nav className='navbar'>
        {login && <button onClick={() => navigate("/viajes")} type="button" class="btn btn-primary" className = 'botones-pagina-principal'>Viajes</button>}
        {login && <button onClick={disconnect} type="button" class="btn btn-primary" className = 'botones-pagina-principal'>Cerrar Sesión</button>}
      </nav>
      <Routes>
        <Route path="/" element={<MenuPrincipalComponent/>}></Route>
        <Route path="/register" element={<RegisterUserComponent/>}></Route>
        <Route path="/login" element={<LoginUserComponent setLogin={setLogin}/>}></Route>
        <Route path="/viajes" element={<ViajesComponent createNotification={createNotification}/>}></Route>
      </Routes>
    </div>
  );
}

export default App;