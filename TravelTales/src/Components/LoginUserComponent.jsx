import { useState,useEffect } from "react";
import {backendUrl} from "../Globals"
import { useNavigate } from "react-router-dom";
import FormField from "./FormFieldComponent";

let LoginUserComponent = (props) =>{
    let [contrasena,setContrasena] =useState(null)
    let [email,setEmail] =useState(null)

    let [mensaje,setMessage]=useState("")
    let [error,setError]=useState({})

    let {setLogin, createNotification}=props
    let navigate = useNavigate()

    useEffect(()=>{
        checkData();
    },[contrasena,email])

    let checkData = () =>{
        let newErrors = {}
        if( contrasena == "" )
            newErrors.contrasena= "La contraseña debe tener un valor"
        if(email == "" )
            newErrors.email= "El email debe tener un valor"
        setError(newErrors)
    }
    let loginUser = async(event) =>{
        event.preventDefault();
        if (Object.keys(error).length > 0){
            createNotification("No debe haber errores para poder iniciar sesión")
        }else{
            let response = await fetch(backendUrl+"/users/login",
            {method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({
                    email:email,
                    contrasena:contrasena
                }) 
            })
            if(response.ok){
                let jsonData= await response.json()
                if(jsonData.apiKey!=null){
                    localStorage.setItem("apiKey",jsonData.apiKey)
                    localStorage.setItem("userId",jsonData.id)
                    localStorage.setItem("email",jsonData.email)
                }
                setMessage("Sesión iniciada") 
                setLogin(true)
                navigate("/viajes")
            }else{
                let jsonData = await response.json()
                let errors=""
                if(jsonData.errors!=null){
                    jsonData.errors.array.forEach(e => {
                        errors+=e+" "
                    });
                    setMessage(errors)
                }else
                    setMessage(jsonData.error)
            }
        }
    }

    return (
        <div class='card bg-transparent'>
            <h1 class="card-header">Travel Tales</h1>
            <div class='card-body bg-white  carta-registro'>
                <h2 class='card-title'>Iniciar Sesión</h2>
                {<h3>{mensaje}</h3>}
                <form>
                <FormField id="correo" label="CORREO" placeholder="correo@correo.com" value={email} onChange={(e) => setEmail(e.currentTarget.value)} errors={error.email?[error.email]:[]} />
                <FormField id="contrasena" label="CONTRASEÑA" type="password" value={contrasena} onChange={(e) => setContrasena(e.currentTarget.value)} errors={error.contrasena?[error.contrasena]:[]} />
                    
                    <div className='d-flex justify-content-between mt-3'> 
                        <button class='btn btn-sm btn-secondary me-2' type='button' onClick={() => window.history.back()}>Volver Atrás</button>
                        <button class='btn btn-sm btn-primary' type='button' onClick={loginUser}>Iniciar Sesión</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginUserComponent;