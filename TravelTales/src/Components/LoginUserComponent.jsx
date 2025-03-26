import { useState,useEffect } from "react";
import {backendUrl} from "../Globals"
import { useNavigate } from "react-router-dom";

let LoginUserComponent = (props) =>{
    let [contrasena,setContrasena] =useState(null)
    let [email,setEmail] =useState(null)

    let [mensaje,setMessage]=useState("")
    let [error,setError]=useState({})

    let {setLogin}=props
    let navigate = useNavigate()

    useEffect(()=>{
        checkData();
    },[contrasena,email])

    let checkData = () =>{
        let newErrors = {}
        if( contrasena == "" )
            newErrors.password= "La contraseña debe tener un valor"
        if(email == "" )
            newErrors.email= "El email debe tener un valor"
        setError(newErrors)
    }
    let loginUser = async() =>{
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
            setMessage("Logged in") //Esto no iria dentro del otro IF?
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

    return (
        <div class='card bg-transparent'>
            <h1 class="card-header">Travel Tales</h1>
            <div class='card-body bg-white  carta-registro'>
                <h2 class='card-title'>Iniciar Sesión</h2>
                {<h3>{mensaje}</h3>}
                <form>
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