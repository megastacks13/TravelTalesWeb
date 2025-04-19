import {useNavigate} from 'react-router-dom'
import { useEffect } from "react";
import '../App.css';
import '../MenuInicio.css';

let InicioComponent = (props) =>{

  let navigate = useNavigate()
  let {login}=props

  useEffect(()=>{
    checkLogin();
  },[])

  let checkLogin = () => {
    if(!login)
      navigate("/")
  }

  return (
    <div>
      
      <h1 className='titulo-pagina-inicio'>Travel Tales</h1>
      {login && 
        <nav className='nav-pagina-inicio'>
          <button onClick={() => navigate("/viajes/anadir")} type="button" class="btn btn-primary btn-lg botones-pagina-inicio">Añadir Viaje</button>
          <button onClick={() => navigate("/viajes/buscar")} type="button" class="btn btn-primary btn-lg botones-pagina-inicio">Buscar Viajes</button>
        </nav>
      }
      
    </div>
  )
}

export default InicioComponent;