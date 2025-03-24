import { useState,useEffect } from "react";
import {backendUrl} from "../Globals"
import { useNavigate } from "react-router-dom";

let LoginUserComponent = (props) =>{
    let [password,setPassword] =useState(null)
    let [email,setEmail] =useState(null)

    let [message,setMessage]=useState("")
    let [error,setError]=useState({})

    let {setLogin}=props
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[password,email])

    let checkData = () =>{
        let newErrors = {}
        if( password == "" )
            newErrors.password= "Password must have a value"
        if(email == "" )
            newErrors.email= "Email must have a value"
        setError(newErrors)
    }
    let loginUser = async() =>{
        let response = await fetch(backendUrl+"/users/login",
        {method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                email:email,
                password:password
            }) 
        })
        if(response.ok){
            let jsonData= await response.json()
            if(jsonData.apiKey!=null){
                localStorage.setItem("apiKey",jsonData.apiKey)
                localStorage.setItem("userId",jsonData.id)
                localStorage.setItem("email",jsonData.email)
            }
            setMessage("Logged in")
            setLogin(true)
            navigate("/myPresents")
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
        <div>
            <h2>Log In</h2>
            <h3>{message}</h3>
            <div>
                <input type='text' placeholder='email' onChange={(e)=>setEmail(e.currentTarget.value)}/>
                {error.email && <p>{error.email}</p>}
                <input type='text' placeholder='password' onChange={(e)=>setPassword(e.currentTarget.value)}/>
                {error.password && <p>{error.password}</p>}
            </div>
            <button onClick={loginUser}>Enter</button>
        </div>
    )
}

export default LoginUserComponent;