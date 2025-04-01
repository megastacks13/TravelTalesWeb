import { useEffect, useState } from "react";
import { backendUrl } from "../Globals";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
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
        <h1>{viaje.nombre}</h1>
        <div>
            <p>Ubicación: {viaje.ubicacion}</p>
            <p>Fecha de Inicio: {viaje.fechaIni}</p>
            <p>Fecha de Finalización: {viaje.fechaFin}</p>
            <p>Número de personas: {viaje.num}</p>
        </div>
        
    </div>)
}

export default ViajeComponent;