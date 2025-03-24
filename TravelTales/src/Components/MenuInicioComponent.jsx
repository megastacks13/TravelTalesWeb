import { useState,useEffect } from "react";
import {backendUrl} from "../Globals"
import {Routes,Route,Link, useNavigate} from 'react-router-dom'
import '../App.css';
import '../MenuInicio.css';

let MenuInicioComponent = (props) =>{
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
    navigate("/login")
  }

  return (
    <div>
      
      {notification!=="" && (
        <div className='notification'>      {notification}
          <span className='close-btn' onClick={()=>{setNotification("")}}>X</span>
        </div>
      )}
      <h1 className='titulo-pagina-inicio'>Travel Tales</h1>
      <nav className='nav-pagina-inicio'>
        {!login && <button onClick={() => navigate("/register")} type="button" class="btn btn-primary btn-lg botones-pagina-inicio">Registrarse</button>}
        {!login && <button onClick={() => navigate("/login")} type="button" class="btn btn-primary btn-lg botones-pagina-inicio">Iniciar Sesión</button>}
      </nav>
      
    </div>
  );
}

export default MenuInicioComponent;