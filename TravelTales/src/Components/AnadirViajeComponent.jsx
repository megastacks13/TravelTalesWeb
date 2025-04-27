import { useState, useEffect } from "react";
import { backendUrl } from "../Globals.js";
import { useNavigate } from "react-router-dom";
import FormField from "./FormFieldComponent.jsx";

let ViajesComponent = (props) => {
  const [nombre, setNombre] = useState(null);
  const [ubicacion, setUbicacion] = useState(null);
  const [fechaIni, setFechaIni] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [numero, setNumero] = useState(1);

  const { createNotification } = props;
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    checkData();
  }, [nombre, ubicacion, fechaIni, fechaFin, numero]);

  const checkData = () => {
    const errores = {};
    if (nombre === "") errores.nombre = "El campo 'nombre' debe tener un valor";
    if (ubicacion === "") errores.ubicacion = "El campo 'ubicación' debe tener un valor";
    if (!Number.isInteger(Number(numero)) || Number(numero) < 1)
      errores.numero = "El número de personas debe ser un número entero mayor o igual a 1";
    setError(errores);
  };

  const addTravel = async (event) => {
    event.preventDefault();
    if (Object.keys(error).length > 0) {
      createNotification("No debe haber errores para poder añadir un viaje");
    } else {
      const response = await fetch(
        `${backendUrl}/viajes/anadir?apiKey=${localStorage.getItem("apiKey")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            ubicacion,
            fechaIni,
            fechaFin,
            num: numero,
          }),
        }
      );
      if (response.ok) {
        navigate("/inicio");
      } else {
        const jsonData = await response.json();
        let errores = "";
        if (jsonData.errors?.array) {
          jsonData.errors.array.forEach((e) => {
            errores += e + " ";
          });
          setMensaje(errores);
        } else {
          setMensaje(jsonData.error);
        }
      }
    }
  };

  return (
    <div className="card bg-transparent">
      <h1 className="card-header">Travel Tales</h1>
      <div className="card-body bg-white carta-registro">
        <h2 className="card-title">Añadir viaje</h2>
        <h3>{mensaje}</h3>
        <form onSubmit={addTravel}>
          <FormField
            id="nombre"
            label="NOMBRE"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.currentTarget.value)}
            errors={error.nombre ? [error.nombre] : []}
          />
          <FormField
            id="ubicacion"
            label="UBICACIÓN"
            placeholder="Ubicación"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.currentTarget.value)}
            errors={error.ubicacion ? [error.ubicacion] : []}
          />
          <FormField
            id="fechaInicio"
            label="FECHA DE INICIO"
            type="date"
            value={fechaIni}
            onChange={(e) => setFechaIni(e.currentTarget.value)}
            placeholder="yyyy/mm/dd"
          />
          <FormField
            id="fechaFin"
            label="FECHA DE FINALIZACIÓN"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.currentTarget.value)}
            placeholder="yyyy/mm/dd"
          />
          <FormField
            id="numero"
            label="NÚMERO DE VIAJEROS"
            placeholder="1"
            value={numero}
            type="number"
            min="1"
            onChange={(e) => {
              if (e.currentTarget.value >= 1) setNumero(e.currentTarget.value);
            }}
            errors={error.numero ? [error.numero] : []}
          />

          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-sm btn-secondary me-2"
              type="button"
              onClick={() => window.history.back()}
            >
              Volver Atrás
            </button>
            <button className="btn btn-sm btn-primary" type="submit">
              Añadir viaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ViajesComponent;
