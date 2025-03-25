import { useEffect, useState } from "react";
import {backendUrl} from "../Globals"
import { useNavigate } from "react-router-dom";
import '../PaginaRegistro.css';

let RegisterUserComponent = () =>{
    let [nombre,setNombre] =useState(null)
    let [apellidos,setApellidos] =useState(null)
    let [email,setEmail] =useState(null)
    let [contrasena,setContrasena] =useState(null)
    let [contrasena2,setContrasena2] =useState(null)
    
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
        if(contrasena == "" )
            errores.contrasena= "El campo 'contraseña' debe tener un valor"
        if(contrasena2 == "" )
            errores.contrasena2= "El campo 'repetir contraseña' debe tener un valor"
        if(contrasena!==contrasena )
            errores.coincicir= "Las dos contraseñas deben coindicir"
        setError(errores)
    }
    let registerUser = async() =>{
        //añadir logica para que si errores, no deje hacer la peticion
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

    return (
        <div class='card bg-transparent'>
            <h1 class="card-header">Travel Tales</h1>
 
            <div class='card-body bg-white  carta-registro'>
                <h2 class='card-title'>Registrarse</h2>
                <h3>{mensaje}</h3>
                <form>
                    <div class='mb-3'>
                        <label for="nombre" class='form-label'>NOMBRE</label>
                        <input id='nombre' class='form-control' type='text' placeholder='Nombre' onChange={(e)=>setNombre(e.currentTarget.value)}/>
                        {error.nombre && <p class='text-danger'>{error.nombre}</p>}
                    </div>
                    <div class='mb-3'>
                        <label for="apellidos" class='form-label'>APELLIDOS</label>
                        <input id='apellidos' class='form-control' type='text' placeholder='Apellidos' onChange={(e)=>setApellidos(e.currentTarget.value)}/>
                        {error.apellidos && <p class='text-danger'>{error.apellidos}</p>}
                    </div>
                    
                    <div class='mb-3'>
                        <label for="correo" class='form-label'>CORREO</label>
                        <input id='correo' class='form-control' type='text' placeholder='correo@correo.com' onChange={(e)=>setEmail(e.currentTarget.value)}/>
                        {error.email && <p class='text-danger'>{error.email}</p>}
                    </div>
                    
                    <div class='mb-3'>
                        <label for="contrasena" class='form-label'>CONTRASEÑA</label>
                        <input id='contrasena' class='form-control' type='password' onChange={(e)=>setContrasena(e.currentTarget.value)}/>
                        {error.contrasena && <p class='text-danger'>{error.contrasena}</p>}
                    </div>
                    
                    <div class='mb-3'>
                        <label for="contrasena2" class='form-label'>REPETIR CONTRASEÑA</label>
                        <input id='contrasena2' class='form-control' type='password' onChange={(e)=>setContrasena2(e.currentTarget.value)}/>
                        {error.contrasena2 && <p class='text-danger'>{error.contrasena2}</p>}
                        {error.coincidir && <p class='text-danger'>{error.coincidir}</p>}
                    </div>
                    
                    <div className='d-flex justify-content-between mt-3'> 
                        <button class='btn btn-sm btn-secondary me-2' type='button' onCLick={() => window.history.back()}>Volver Atrás</button>
                        <button class='btn btn-sm btn-primary' onClick={registerUser}>Crear Cuenta</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterUserComponent;