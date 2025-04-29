import { useState, useEffect } from "react";
import { backendUrl } from "../Globals.js";
import { useNavigate } from "react-router-dom";
import FormField from "./FormFieldComponent.jsx";
import ViajesUsuarioComponent from "./ViajesUsuarioComponent.jsx";

let BuscarViajeComponent = ( )=>{
    let [nombre,setNombre] =useState(null)
    let [viajes, setViajes] = useState([])

    useEffect(()=>{
        buscarViaje();
    },[])

    let navigate = useNavigate()

    function isNameEmpty(name) {
        return name === null || name === undefined || name.trim() === "";
    }
  
    let buscarViaje = async() =>{
        if (isNameEmpty(nombre)){ // si no la búsqueda es vacía
            let response = await fetch(backendUrl + "/viajes?apiKey=" + localStorage.getItem("apiKey"))
            if (response.status == 401) {
                navigate("/login")
                return
            }
            if (response.ok) {
                let jsonData = await response.json()
                setViajes(jsonData)
            }
        }else{
            let response = await fetch(backendUrl + "/viajes/filtrar?localizacion="+nombre+
                "&apiKey=" + localStorage.getItem("apiKey"))
            if (response.status == 401) {
                navigate("/login")
                return
            }
            if (response.ok) {
                let jsonData = await response.json()
                setViajes(jsonData)
            }
        }
    }

    return (
    <div>
        <div class='card bg-transparent container-misViajes'>
            <h1 class='mt-4'>Buscar viaje por localización</h1>
            <div class='card-body bg-white buscar-viaje w-50'>
                <form>
                    <FormField id="nombre" label="Ubicación" placeholder="Paris, Roma ..." value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} />
                    <div className='d-flex justify-content-between mt-3'> 
                        <button class='btn btn-sm btn-primary' type='submit' onClick={buscarViaje}>Buscar</button>
                    </div>
                </form>
            </div>
            <ViajesUsuarioComponent viajes={viajes}/>
        </div>    
    </div>
)
}

export default BuscarViajeComponent;