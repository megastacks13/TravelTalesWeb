import { useState, useEffect } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";

let PlanificacionViaje = () => {
    let [nombre, setNombre] = useState("");
    let [fecha, setFecha] = useState("");
    let [numPersonas, setNumPersonas] = useState("");
    let [lugar, setLugar] = useState("");
    let [message, setMessage] = useState("");
    let [error, setError] = useState({});
    
    let navigate = useNavigate();

    let checkData = () => {
        let newErrors = {};
        if (nombre.trim() === "") newErrors.nombre = "El nombre del viaje es obligatorio";
        if (fecha === "" || new Date(fecha) < new Date()) newErrors.fecha = "La fecha debe ser futura";
        if (numPersonas <= 0) newErrors.numPersonas = "El número de personas debe ser mayor que cero";
        if (lugar.trim() === "") newErrors.lugar = "Debe especificar un lugar válido";
        setError(newErrors);
    };

    let addPlanificacion = async () => {
        checkData();
        if (Object.keys(error).length > 0) return;

        let response = await fetch(backendUrl + "/viajes?apiKey=" + localStorage.getItem("apiKey"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre,
                fecha,
                numPersonas,
                lugar,
                userId: localStorage.getItem("userId"),
            })
        });

        if (response.ok) {
            setMessage("Viaje añadido correctamente");
            navigate("/viajes");
        } else {
            let jsonData = await response.json();
            setMessage(jsonData.error || "Error al añadir el viaje");
        }
    };

    return (
        <div className='card bg-transparent'>
            <h1 className='card-header'>Travel Tales</h1>
            <div className='card-body bg-white carta-registro'>
                <h2 className='card-title'>Planificacion Viaje</h2>
                {message && <h3>{message}</h3>}
                <form>
                    <div className='mb-3'>
                        <label htmlFor='nombre' className='form-label'>Nombre</label>
                        <input id='nombre' className='form-control' type='text' value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} />
                        {error.nombre && <p className='text-danger'>{error.nombre}</p>}
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='fecha' className='form-label'>Fecha</label>
                        <input id='fecha' className='form-control' type='date' value={fecha} onChange={(e) => setFecha(e.currentTarget.value)} />
                        {error.fecha && <p className='text-danger'>{error.fecha}</p>}
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='numPersonas' className='form-label'>Número de personas</label>
                        <input id='numPersonas' className='form-control' type='number' value={numPersonas} onChange={(e) => setNumPersonas(e.currentTarget.value)} />
                        {error.numPersonas && <p className='text-danger'>{error.numPersonas}</p>}
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='lugar' className='form-label'>Lugar</label>
                        <input id='lugar' className='form-control' type='text' value={lugar} onChange={(e) => setLugar(e.currentTarget.value)} />
                        {error.lugar && <p className='text-danger'>{error.lugar}</p>}
                    </div>
                    <div className='d-flex justify-content-between mt-3'> 
                        <button className='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                        <button className='btn btn-sm btn-primary' type='button' onClick={addPlanificacion}>Añadir Viaje</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanificacionViaje;
