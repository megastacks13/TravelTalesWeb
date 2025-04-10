import {Routes,Route,Link, useNavigate} from 'react-router-dom'
import { useEffect } from "react";
import '../App.css';
import '../MenuInicio.css';

let MenuInicioComponent = (props) =>{

  let navigate = useNavigate()
  let {login}=props

  useEffect(()=>{
    checkLogin();
  })

  let checkLogin = () => {
    if(login)
      navigate("/inicio")
  }


  return (
    <div>
      
      <h1 className='titulo-pagina-inicio'>Travel Tales</h1>
      <nav className='nav-pagina-inicio'>
        <button onClick={() => navigate("/register")} type="button" class="btn btn-primary btn-lg botones-pagina-inicio">Registrarse</button>
        <button onClick={() => navigate("/login")} type="button" class="btn btn-primary btn-lg botones-pagina-inicio">Iniciar Sesión</button>
      </nav>
      
    </div>
  )
}

export default MenuInicioComponent;