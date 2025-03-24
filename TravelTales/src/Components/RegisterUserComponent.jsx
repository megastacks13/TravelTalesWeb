import { useEffect, useState } from "react";
import {backendUrl} from "../Globals"
import { useNavigate } from "react-router-dom";

let RegisterUserComponent = () =>{
    let [name,setName] =useState(null)
    let [password,setPassword] =useState("")
    let [email,setEmail] =useState(null)

    let [message,setMessage]=useState("")
    let [error,setError]=useState({})
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[name,email,password])

    let checkData = () =>{
        let newErrors = {}
        if( name == "" )
            newErrors.name= "Name must have a value"
        if(email == "" )
            newErrors.email= "Email must have a value"
        if(password == "" )
            newErrors.password= "Password must have a value"
        setError(newErrors)
    }
    let registerUser = async() =>{
        let response = await fetch(backendUrl+"/users",
        {method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                email:email,
                name:name,
                password:password
            }) 
        })
        if(response.ok){
            //let jsonData= await response.json()
            navigate("/login")
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
            <h2>Register User</h2>
            <h3>{message}</h3>
            <div>
                <div>
                    <input type='text' placeholder='email' onChange={(e)=>setEmail(e.currentTarget.value)}/>
                </div>
                {error.email && <p>{error.email}</p>}
                <div>
                    <input type='text' placeholder='name' onChange={(e)=>setName(e.currentTarget.value)}/>
                </div>
                {error.name && <p>{error.name}</p>}
                <div>
                    <input type='text' placeholder='password' onChange={(e)=>setPassword(e.currentTarget.value)}/>
                </div>
                {error.password && <p>{error.password}</p>}
            </div>
            <button onClick={registerUser}>Register</button>
        </div>
    )
}

export default RegisterUserComponent;