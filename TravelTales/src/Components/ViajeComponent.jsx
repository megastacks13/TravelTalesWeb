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

    const generarFondoGradiente = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const color1 = `hsl(${hash % 360}, 50%, 90%)`; 
        const color2 = `hsl(${(hash * 2) % 360}, 60%, 85%)`; 
        return `linear-gradient(to right, ${color1}, ${color2})`;
    };

    const anadirBlog = async () => {   
        console.log("Ejecutando metodo")     
        let response = await fetch(backendUrl+"/viajes/"+id+"/anadirBlog?apiKey=" + localStorage.getItem("apiKey"), 
            {method: "POST"})

        if(response.ok) {
            location.reload();
        }
        else {
            let jsonData = await response.json()
            let errors=""
            if(jsonData.errors!=null){
                jsonData.errors.forEach(e => {
                    errors+=e+" "
                });
                setMessage(errors)
            }else
                setMessage(jsonData.error)
        }
    }

    return (
        <div>
            {message&& 
                <p>{message}</p>
            }
            {
                Object.entries(viaje).length > 0 && 
                <div class="container contenedor-vista-basica">
                <div class='card border-dark'>
                    <h3 class="card-header nombre-viaje-vista-basica"
                    style={{ background: generarFondoGradiente(viaje.nombre) }}>
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
                        <div class="mt-3">
                            {!viaje.blog && <button onClick={anadirBlog}>Añadir Blog</button>}
                            {viaje.blog && <div class="texto-informativo">Ya tiene blog</div>}
                        </div>
                    </div>
                </div>
                </div>
            }
        </div>)
}

export default ViajeComponent;