import { useState,useEffect } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";
import FormField from "./FormFieldComponent.jsx";

let ViajesComponent = ( props)=>{
    let [nombre,setNombre] =useState(null)
    let [ubicacion,setUbicacion] =useState(null)
    let [fechaIni,setFechaIni] =useState(null)
    let [fechaFin,setFechaFin] =useState(null)
    let [numero,setNumero] =useState(null)
    
    let {createNotification}=props
    let [mensaje,setMensaje]=useState("")
    let [error,setError]=useState({})
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[nombre,ubicacion,fechaIni,fechaFin,numero])
    

    let checkData = () =>{
        let errores = {}
        if( errores.nombre == "" )
            errores.nombre= "El campo 'nombre' debe tener un valor"
        if( errores.ubicacion == "" )
            errores.ubicacion= "El campo 'ubicación' debe tener un valor"
        if( errores.fechaIni <0 )
            errores.price= "The price must have a positive value"
        if( errores.fechaFin == "" )
            errores.url= "Url must have a value"
        if (!Number.isInteger(errores.numero) || Number(num) < 1)
            errores.numero = "El número de personas debe ser un número entero mayor o igual a 1";
        setError(errores)
    }

    let changeProperty = (propertyName, e)=>{
        let newPresent = {...error, [propertyName]:e.currentTarget.value}
        setError(newPresent)
    }

    let addPresentButton = async() =>{
        let newPresent = {...error,email:localStorage.getItem("email")}
        let response = await fetch(backendUrl+"/presents?apiKey="+localStorage.getItem("apiKey"),{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(newPresent)
        })
        if(response.ok){
            setMensaje("Present uploaded")
            createNotification("Present correctly uploaded")
            navigate("/")
        }else{
            let jsonData = await response.json()
            setMensaje(jsonData.error)
        }

    }

    return (
    <div class='card bg-transparent'>
        <h1 class="card-header">Travel Tales</h1>

        <div class='card-body bg-white  carta-registro'>
            <h2 class='card-title'>Añadir viaje</h2>
            <h3>{mensaje}</h3>
            <form>
                <FormField id="nombre" label="NOMBRE" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} errors={error.nombre ? [error.nombre] : []} />
                <FormField id="ubicacion" label="UBICACIÓN" placeholder="Ubicación" value={ubicacion} onChange={(e) => setApellidos(e.currentTarget.value)} errors={error.apellidos ? [error.apellidos] : []} />
                <FormField id="fechaIni" label="FECHA DE INICIO" placeholder="01/01/0001" value={fechaIni} onChange={(e) => setEmail(e.currentTarget.value)} errors={[error.email, error.email_format].filter(Boolean)} />
                <FormField id="fechaFin" label="FECHA DE FIN" placeholder="31/12/9999" value={fechaFin} onChange={(e) => setContrasena(e.currentTarget.value)} errors={[error.contrasena, error.contrasena_format].filter(Boolean)} />
                <FormField id="numero" label="NÚMERO DE VIAJEROS" placeholder="Nº de viajeros" value={numero} onChange={(e) => setContrasena2(e.currentTarget.value)} errors={[error.contrasena2, error.coincidir].filter(Boolean)} />

                <div className='d-flex justify-content-between mt-3'> 
                    <button class='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                    <button class='btn btn-sm btn-primary' onClick={addPresentButton}>Añadir viaje</button>
                </div>
            </form>
        </div>
    </div>
)
}

export default ViajesComponent;