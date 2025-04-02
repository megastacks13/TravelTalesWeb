import '../NavBar.css';
import {useNavigate} from 'react-router-dom'

let NavBarComponent = (props) =>{
    let {disconnect}=props;
    let navigate = useNavigate();
    return (
        <div>
            <div class="container">
            <nav class="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
                <a class="navbar-brand" onClick={() => navigate("/inicio")}>Travel Tales</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="vr bg-light"></div>
                <div class="collapse navbar-collapse " id="navbarSupportedContent">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item active">
                            <a class="nav-link" onClick={() => navigate("/viajes/anadir")}>Añadir Viajes</a>
                        </li>
                        <div class="vr bg-light"></div>
                        <li class="nav-item">
                            <a class="nav-link" onClick={() => navigate("/viajes/buscar")}>Ver Viajes</a>
                        </li>
                    </ul>
                    
                    <ul class="navbar-nav ms-auto"> 
                        <div class="vr bg-light"></div>
                        <li class="nav-item cerrar-sesion">
                            <a class="nav-link link-cerrar-sesion" href="/" onClick={disconnect}>Cerrar sesión</a> 
                        </li>
                    </ul>  
                </div>
            </nav>
            </div>
        </div>
    )
}

export default NavBarComponent;