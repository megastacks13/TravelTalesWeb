import { useState, useEffect } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import '../ViajesUsuario.css';

let ViajesUsuarioComponent = () => {
    let [viajes, setViajes] = useState([])
    let navigate = useNavigate()

    useEffect(() => {
        buscarViajes()
    }, [])

    let buscarViajes = async () => {
        let response = await fetch(backendUrl + "/viajes?apiKey=" + localStorage.getItem("apiKey"))
        if (response.status == 401) {
            navigate("/login")
            return
        }
        if (response.ok) {
            let jsonData = await response.json()
            setViajes(jsonData)
            console.log(viajes)
        }
    }
    const generarFondoGradiente = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color1 = `hsl(${hash % 360}, 50%, 90%)`; 
        const color2 = `hsl(${(hash * 2) % 360}, 600%, 85%)`; 
        return `linear-gradient(to right, ${color1}, ${color2})`;
    };

    return (
        <div class="container-misViajes">
            <div class="container-titulo-misViajes">
                <h1 class="text-center">Mis Viajes</h1>
            </div>
            <div class="container container-viajes">
                {Object.entries(viajes).length > 0 && (
                    <div class="row">
                        {Object.entries(viajes).map(([key, v]) => (
                            <div key={key} class="col-12 col-md-6 col-lg-4 mb-3">
                                <div class="card shadow-sm tarjeta-viaje"
                                style={{ background: generarFondoGradiente(v.nombre) }}
                                onClick={() => navigate(`/viajes/${key}`)}>
                                    {/* se podrían añadir imágenes, botones, descripciones, etc */}
                                    <div class="card-body text-center">
                                        <h5 class="card-title">{v.nombre}</h5>
                                        <p class="card-text"></p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
    
}

export default ViajesUsuarioComponent;