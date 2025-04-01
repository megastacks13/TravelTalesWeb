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

    const [alerta, setAlerta] = useState(false);

 
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

    useEffect(() => {
        if (localStorage.getItem("planificacionSuccess")) {
            setAlerta(true); // Show success alert
            localStorage.removeItem("planificacionSuccess"); // Clean up after showing the alert
        }
    }, []);

    const anadirPlanificacion = async () => {
        let response = await fetch(backendUrl+"/viajes/"+id+"/anadirPlanificacion?apiKey=" + localStorage.getItem("apiKey"), 
            {method: "POST"})
            if(response.ok){
                localStorage.setItem("planificacionSuccess", "true"); // Set a flag before reloading
                location.reload();
            }else{
                let jsonData = await response.json()
                let errores=""
                if(jsonData.errors!=null){
                    jsonData.errors.array.forEach(e => {
                        errores+=e+" "
                    });
                    setMessage(errores)
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
                    </div>
                    <div>
                        {!viaje.planificacion && 
                            <button onClick={anadirPlanificacion}>
                            Añadir Planificación</button>
                        }
                    </div>
                </div>
            </div>
            }
            <div>
            {alerta &&
                <div class="alert alert-primary alert-dismissible fade show" role="alert">
                <strong>Planificación creada para el viaje</strong>
                <button type="button" class="close" data-dismiss="alert" aria-label="Close" onClick={()=>{setAlerta(false)}}>
                  <span aria-hidden="true">&times;</span>
                </button>
                </div>
                    }
            </div>
            
        </div>)
}

export default ViajeComponent;