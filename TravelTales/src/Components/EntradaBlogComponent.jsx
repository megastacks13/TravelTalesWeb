import { useState,useEffect } from "react";
import { backendUrl } from "../Globals.js";
import { useNavigate } from "react-router-dom";
import FormField from "./FormFieldComponent.jsx";

let EntradaBlogComponent = ( props)=>{    
    let {createNotification}=props
    let [mensaje,setMensaje]=useState("")
    let [error,setError]=useState({})
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[nombre,ubicacion,fechaIni,fechaFin,numero])
    

    let addEntrada = async(event) => {
        event.preventDefault();
        if (Object.keys(error).length > 0) {
            createNotification("No debe haber errores para poder añadir una entrada de blog con texto")
        } else {
            let response = await fetch(backendUrl+"/viajes/anadir?apiKey="+localStorage.getItem("apiKey"), 
            {method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    nombre:nombre,
                    ubicacion:ubicacion,
                    fechaIni:fechaIni,
                    fechaFin:fechaFin,
                    num:numero
                }) 
            })
            if(response.ok){
                navigate("/inicio")
                createNotification("Añadida entrada de blog con texto con éxito.")
            }else{
                let jsonData = await response.json()
                let errores=""
                if(jsonData.error!=null){
                    jsonData.error.forEach(e => {
                        errores+=e+", "
                    });
                    setMensaje(errores)
                }else
                    setMensaje(jsonData.error)
                
            }
        }
    }

    return (
    <div class='card bg-transparent'>
        <h1 class="card-header">Travel Tales</h1>
        
        <div class='card-body bg-white  carta-registro'>
            <h2 class='card-title'>Añadir viaje</h2>
            <h3 class="errorMessage">{mensaje}</h3>
            <form>

                <div className='d-flex justify-content-between mt-3'> 
                    <button class='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                    <button class='btn btn-sm btn-primary' type='submit' onClick={addTravel}>Añadir viaje</button>
                </div>
            </form>
        </div>
    </div>
)
}

export default EntradaBlogComponent;