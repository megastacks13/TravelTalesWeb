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
        let errores = {};
        let regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if(nombre == "" )
            errores.nombre= "El campo 'nombre' debe tener un valor";
        if(ubicacion == "" )
            errores.ubicacion= "El campo 'ubicación' debe tener un valor";
        if(!regex.test(fechaIni))
            errores.fechaIni= "La fecha de inicio debe cumplir con un formato adecuado (dd/mm/yyyy)";
        if(!regex.test(fechaFin))
            errores.fechaFin= "La fecha de fin debe cumplir con un formato adecuado (dd/mm/yyyy)";
        if (!Number.isInteger(Number(numero)) || Number(numero) < 1)
            errores.numero = "El número de personas debe ser un número entero mayor o igual a 1";
        setError(errores);
    }

    let addTravel = async(event) =>{
        event.preventDefault();
        console.log(error);
        if (Object.keys(error).length > 0){
            createNotification("No debe haber errores para poder añadir un viaje")
        }else{
            let response = await fetch(backendUrl+"/viajes/anadir", 
            {method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    nombre:nombre,
                    ubicacion:ubicacion,
                    fechaIni:fechaIni,
                    fechaFin:fechaFin,
                    numero:numero
                }) 
            })
            if(response.ok){
                navigate("/inicio")
            }else{
                let jsonData = await response.json()
                let errores=""
                if(jsonData.errors!=null){
                    jsonData.errors.array.forEach(e => {
                        errores+=e+" "
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
            <h3>{mensaje}</h3>
            <form>
                <FormField id="nombre" label="NOMBRE" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} errors={error.nombre ? [error.nombre] : []} />
                <FormField id="ubicacion" label="UBICACIÓN" placeholder="Ubicación" value={ubicacion} onChange={(e) => setUbicacion(e.currentTarget.value)} errors={error.ubicacion ? [error.ubicacion] : []} />
                <FormField id="fechaIni" label="FECHA DE INICIO" placeholder="01/01/0001" value={fechaIni} onChange={(e) => setFechaIni(e.currentTarget.value)} errors={error.fechaIni ? [error.fechaIni] : []} />
                <FormField id="fechaFin" label="FECHA DE FIN" placeholder="31/12/9999" value={fechaFin} onChange={(e) => setFechaFin(e.currentTarget.value)} errors={error.fechaFin ? [error.fechaFin] : []} />
                <FormField id="numero" label="NÚMERO DE VIAJEROS" placeholder="Nº de viajeros" value={numero} onChange={(e) => setNumero(e.currentTarget.value)} errors={error.numero ? [error.numero] : []} />

                <div className='d-flex justify-content-between mt-3'> 
                    <button class='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                    <button class='btn btn-sm btn-primary' onClick={addTravel}>Añadir viaje</button>
                </div>
            </form>
        </div>
    </div>
)
}

export default ViajesComponent;