import { useState,useEffect } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import '../ViajesUsuario.css';

let ViajesUsuarioComponent = () =>{
    let [viajes,setViajes]=useState([])
    let navigate = useNavigate()

    useEffect(()=>{
        buscarViajes()
    },[])

    let buscarViajes = async()=>{
        let response = await fetch(backendUrl+"/viajes?apiKey="+localStorage.getItem("apiKey"))
        if(response.status==401){
            navigate("/login")
            return
        }
        if(response.ok){
            let jsonData = await response.json()
            setViajes(jsonData)
        }
    }
    return (

        <div class='container-misViajes'>
            <h1>Mis Viajes</h1>
            {Object.entries(viajes).length > 0 && (
                    <div>
                    <ul>
                        {Object.entries(viajes).map(([key, v]) => (
                            <div class="card">
                                <li key={key}>{v.nombre}</li>
                            </div>
                        ))}
                    </ul>
                    </div>
            )}

            
        </div>
    )
}

export default ViajesUsuarioComponent;