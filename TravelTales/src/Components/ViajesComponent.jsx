import { useState,useEffect } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";

let ViajesComponent = ( props)=>{
    let [present,setPresent] = useState({})
    let [message,setMessage] = useState("")
    let [error,setError]=useState({})
    
    let {createNotification}=props
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[present])
    

    let checkData = () =>{
        let newErrors = {}
        if( present.name == "" )
            newErrors.name= "Name must have a value"
        if( present.description == "" )
            newErrors.description= "Description must have a value"
        if( present.price <0 )
            newErrors.price= "The price must have a positive value"
        if( present.url == "" )
            newErrors.url= "Url must have a value"
        setError(newErrors)
    }

    let changeProperty = (propertyName, e)=>{
        let newPresent = {...present, [propertyName]:e.currentTarget.value}
        setPresent(newPresent)
    }

    let addPresentButton = async() =>{
        let newPresent = {...present,email:localStorage.getItem("email")}
        let response = await fetch(backendUrl+"/presents?apiKey="+localStorage.getItem("apiKey"),{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(newPresent)
        })
        if(response.ok){
            setMessage("Present uploaded")
            createNotification("Present correctly uploaded")
            navigate("/myPresents")
        }else{
            let jsonData = await response.json()
            setMessage(jsonData.error)
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
                <FormField id="ubicacion" label="UBICACIÓN" placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.currentTarget.value)} errors={error.apellidos ? [error.apellidos] : []} />
                <FormField id="fechaIni" label="FECHA DE INICIO" placeholder="correo@correo.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} errors={[error.email, error.email_format].filter(Boolean)} />
                <FormField id="fechaFin" label="FECHA DE FIN" type="password" value={contrasena} onChange={(e) => setContrasena(e.currentTarget.value)} errors={[error.contrasena, error.contrasena_format].filter(Boolean)} />
                <FormField id="numero" label="NÚMERO DE VIAJEROS" type="password" value={contrasena2} onChange={(e) => setContrasena2(e.currentTarget.value)} errors={[error.contrasena2, error.coincidir].filter(Boolean)} />

                <div className='d-flex justify-content-between mt-3'> 
                    <button class='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                    <button class='btn btn-sm btn-primary' onClick={registerUser}>Añadir viaje</button>
                </div>
            </form>
        </div>
    </div>
)
}

export default ViajesComponent;