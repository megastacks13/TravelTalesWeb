import { useState,useEffect } from "react";
import { backendUrl } from "../Globals.js";
import { Form, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import FormField from "./FormFieldComponent.jsx";

let EntradaBlogComponent = ( props)=>{  
    let [titulo,setTitulo] =useState(null)  
    let [fecha,setFecha]=useState(null)
    let [texto,setTexto]=useState(null)
    let {id}=useParams()

    let {createNotification}=props
    let [mensaje,setMensaje]=useState("")
    let [error,setError]=useState({})
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[titulo,fecha,texto])

    let checkData = () => {
        let newErrors = {};
    
        if (titulo!=null && titulo.trim().length < 3) {
            newErrors.titulo = "El título debe tener al menos 3 caracteres";
        }
    
        if (fecha!=null && isNaN(Date.parse(fecha))) {
            newErrors.fecha = "La fecha es obligatoria y debe ser válida";
        }
    
        if (texto!=null && texto.trim().length < 3) {
            newErrors.texto = "El texto debe tener al menos 3 caracteres";
        }
    
        setError(newErrors);
    };
    
    let addEntrada = async(event) => {
        event.preventDefault();
        if (Object.keys(error).length > 0) {
            createNotification("No debe haber errores para poder añadir una entrada de blog con texto")
        } else {
            let response = await fetch(backendUrl+"/viajes/"+id+"/anadirEntrada?apiKey="+localStorage.getItem("apiKey"), 
            {method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    titulo:titulo,
                    fecha:fecha,
                    contenido:texto
                }) 
            })
            if(response.ok){
                navigate("/viajes/"+id+"?apiKey="+localStorage.getItem("apiKey"))
                createNotification("Añadida entrada de blog con texto con éxito.")
            }else{
                let jsonData = await response.json()
                createNotification("La fecha es incorrecta")
                setMensaje(jsonData.error)
                
            }
        }
    }

    return (
    <div class='card bg-transparent'> 
        <h1 class="card-header">Travel Tales</h1>
        
        <div class='card-body bg-white  carta-registro'>
            <h2 class='card-title'>Añadir Entrada</h2>
            <h3 class="errorMessage">{mensaje}</h3>
            <form>
                <FormField 
                    id="fecha" 
                    label="FECHA" 
                    type="date" 
                    value={fecha} 
                    onChange={(e) => setFecha(e.currentTarget.value)} errors={error.fechas ? [error.fechas] : []}
                    placeholder='yyyy/mm/dd' 
                />
                <FormField
                    id="texto"
                    label="TEXTO"
                    placeholder="Texto"
                    value={texto} onChange={(e) => setTexto(e.currentTarget.value)}
                    errors={error.texto ? [error.texto] : []}
                />
                <div className='d-flex justify-content-between mt-3'> 
                    <button class='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                    <button class='btn btn-sm btn-primary' type='submit' onClick={addEntrada}>Añadir entrada</button>
                </div>
            </form>
        </div>
    </div>
)
}

export default EntradaBlogComponent;