import { useState,useEffect } from "react";
import { backendUrl } from "../Globals";
import { useNavigate } from "react-router-dom";

let ViajesComponent = ( props)=>{
    let [present,setPresent] = useState({})
    let [message,setMessage] = useState("")
    let [error,setError]=useState({})
    
    let {createNotification}=props
    let navigate = useNavigate()
    useEffect(()=>{
        checkData();
    },[present])
    

    let checkData = () =>{
        let newErrors = {}
        if( present.name == "" )
            newErrors.name= "Name must have a value"
        if( present.description == "" )
            newErrors.description= "Description must have a value"
        if( present.price <0 )
            newErrors.price= "The price must have a positive value"
        if( present.url == "" )
            newErrors.url= "Url must have a value"
        setError(newErrors)
    }

    let changeProperty = (propertyName, e)=>{
        let newPresent = {...present, [propertyName]:e.currentTarget.value}
        setPresent(newPresent)
    }

    let addPresentButton = async() =>{
        let newPresent = {...present,email:localStorage.getItem("email")}
        let response = await fetch(backendUrl+"/presents?apiKey="+localStorage.getItem("apiKey"),{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(newPresent)
        })
        if(response.ok){
            setMessage("Present uploaded")
            createNotification("Present correctly uploaded")
            navigate("/myPresents")
        }else{
            let jsonData = await response.json()
            setMessage(jsonData.error)
        }

    }

    return (
    <div>
        <h2>Add Present</h2>
        {message!="" && <h3>{message}</h3>}
        <div>
            <input type='text' placeholder="name" onChange={(e)=>changeProperty("name",e)}/>
            {error.name&&<p>{error.name}</p>}
            <input type='text' placeholder="description" onChange={(e)=>changeProperty("description",e)}/>
            {error.description&&<p>{error.description}</p>}
            <input type='number' placeholder="price" onChange={(e)=>changeProperty("price",e)}/>
            {error.price&&<p>{error.price}</p>}
            <input type='text' placeholder="url" onChange={(e)=>changeProperty("url",e)}/>
            {error.url&&<p>{error.url}</p>}
        </div>
        <button onClick={addPresentButton}>Add Present</button>
    </div>)
}

export default ViajesComponent;