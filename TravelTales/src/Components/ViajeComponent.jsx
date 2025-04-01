import { useEffect, useState } from "react";
import { backendUrl } from "../Globals";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../VistaViajeBasico.css"
let ViajeComponent = ()=>{
    let [viaje,setViaje]=useState({})
    let [message,setMessage]=useState("")
    let {id}=useParams()
    let navigate = useNavigate()
 
    useEffect(()=>{
        getViaje()
    },[])

    let getViaje = async() => {
        let response = await fetch(backendUrl+"/viajes/"+id+"?apiKey="+localStorage.getItem("apiKey"))
        
        if(response.status==401){
            navigate("/login")
            return
        }
        if(response.ok){
            let jsonData=await response.json()
            setViaje(jsonData)
        }else{
            let jsonData=await response.json()
            setMessage(jsonData.error)
        }
    }

    return (
        <div>
            {message&& 
                <p>{message}</p>
            }
            <div class="container contenedor-vista-basica">
                <div class='card'>
                    <h3 class="card-header nombre-viaje-vista-basica">
                        {viaje.nombre}
                    </h3>
                    <div class='card-body contenedor-datos-vista-basica'>
                        <div class="row">
                            <div class="col-sm-6 conceptos-vista-basica">
                                <p class="item-vista-basica">Ubicación</p>
                                <p class="item-vista-basica">Fecha de Inicio</p>
                                <p class="item-vista-basica">Fecha de Finalización</p>
                                <p class="item-vista-basica">Número de personas</p>
                            </div>

                            <div class="col-sm-6">
                                <p class="item-vista-basica">{viaje.ubicacion}</p>
                                <p class="item-vista-basica">{viaje.fechaIni}</p>
                                <p class="item-vista-basica">{viaje.fechaFin}</p>
                                <p class="item-vista-basica">{viaje.num}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>)
}

export default ViajeComponent;