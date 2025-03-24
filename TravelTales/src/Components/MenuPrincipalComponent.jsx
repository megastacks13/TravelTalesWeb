import { useState,useEffect } from "react";
import {backendUrl} from "../Globals"
import {Routes,Route,Link, useNavigate} from 'react-router-dom'
import '../App.css';
import '../MenuPrincipal.css';

let MenuPrincipalComponent = (props) =>{
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
      <h1 className='titulo-pagina-principal'>Travel Tales</h1>
      <nav className='nav-pagina-principal'>
        {!login && <button onClick={() => navigate("/register")} type="button" class="btn btn-primary" className = 'botones-pagina-principal'>Registrarse</button>}
        {!login && <button onClick={() => navigate("/login")} type="button" class="btn btn-primary" className = 'botones-pagina-principal'>Iniciar Sesión</button>}
      </nav>
    </div>
  );
}

export default MenuPrincipalComponent;