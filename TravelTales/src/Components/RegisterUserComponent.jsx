import { useEffect, useState } from "react";
import {backendUrl} from "../Globals.js"
import { useNavigate } from "react-router-dom";
import '../PaginaRegistro.css';
import FormField from "./FormFieldComponent.jsx";

let RegisterUserComponent = (props) =>{
    let [nombre,setNombre] =useState(null)
    let [apellidos,setApellidos] =useState(null)
    let [email,setEmail] =useState(null)
    let [contrasena,setContrasena] =useState(null)
    let [contrasena2,setContrasena2] =useState(null)
    let {createNotification}=props

    let [mensaje,setMensaje]=useState("")
    let [error,setError]=useState({})
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[nombre,apellidos,email,contrasena,contrasena2])

    let checkData = () =>{
        
        let errores = {}
        if( nombre == "" )
            errores.nombre= "El campo 'nombre' debe tener un valor"
        if( apellidos == "" )
            errores.apellidos= "El campo 'apellidos' debe tener un valor"
        if(email == "" )
            errores.email= "El campo 'email' debe tener un valor"
        if (email != null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            errores.email_format = "El campo 'email' no tiene un formato válido" 
        if(contrasena == "" )
            errores.contrasena= "El campo 'contraseña' debe tener un valor"
        if (contrasena!=null){
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(contrasena))
                errores.contrasena_format = "El campo 'contraseña' debe cumplir con las siguientes características:"
            if (!/^(?=.*[a-z])(?=.*[A-Z])/.test(contrasena))
                errores.contrasena_format += "\n\tAl menos una mayúscula y una minúscula"
            if (!/(?=.*\d)/.test(contrasena))
                errores.contrasena_format += "\n\tAl menos un número"
            if (!/(?=.*[\W_])/.test(contrasena))
                errores.contrasena_format += "\n\tAl menos un caracter especial"
            if (!/.{8,}$/.test(contrasena))    
                errores.contrasena_format += "\n\tAl menos 8 caracteres"
        }
        if(contrasena2 == "" )
            errores.contrasena2= "El campo 'repetir contraseña' debe tener un valor"
        if(contrasena!=null&&contrasena2!=null&&contrasena2!==contrasena )
            errores.coincidir= "Las dos contraseñas deben coincidir"
        setError(errores)
    }
    let registerUser = async(event) =>{
        event.preventDefault();
        console.log(error)
        if (Object.keys(error).length > 0){
            createNotification("No debe haber errores para poder registrarse")
        }else{
            let response = await fetch(backendUrl+"/users/register", 
            {method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    nombre:nombre,
                    apellidos:apellidos,
                    email:email,
                    contrasena:contrasena
                }) 
            })
            if(response.ok){
                navigate("/login")
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
                <h2 class='card-title'>Registrarse</h2>
                <h3>{mensaje}</h3>
                <form>
                    <FormField id="nombre" label="NOMBRE" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.currentTarget.value)} errors={error.nombre ? [error.nombre] : []} />
                    <FormField id="apellidos" label="APELLIDOS" placeholder="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.currentTarget.value)} errors={error.apellidos ? [error.apellidos] : []} />
                    <FormField id="correo" label="CORREO" placeholder="correo@correo.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} errors={[error.email, error.email_format].filter(Boolean)} />
                    <FormField id="contrasena" label="CONTRASEÑA" type="password" value={contrasena} onChange={(e) => setContrasena(e.currentTarget.value)} errors={[error.contrasena, error.contrasena_format].filter(Boolean)} />
                    <FormField id="contrasena2" label="REPETIR CONTRASEÑA" type="password" value={contrasena2} onChange={(e) => setContrasena2(e.currentTarget.value)} errors={[error.contrasena2, error.coincidir].filter(Boolean)} />

                    <div className='d-flex justify-content-between mt-3'> 
                        <button class='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                        <button class='btn btn-sm btn-primary' type='submit' onClick={registerUser}>Crear Cuenta</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterUserComponent;