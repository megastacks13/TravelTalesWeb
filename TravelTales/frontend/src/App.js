import './App.css';
import {Routes,Route,Link, useNavigate} from 'react-router-dom'
import ViajesComponent from './Components/ViajesComponent';
import { useEffect, useState } from 'react';
import LoginUserComponent from './Components/LoginUserComponent';
import RegisterUserComponent from './Components/RegisterUserComponent'

function App() {

  let [notification,setNotification]=useState("")
  let [login,setLogin]=useState(false)
  let navigate = useNavigate()

  let createNotification = (msg) =>{
    setNotification(msg)
    setTimeout(()=>{
      setNotification("")
    },3000)

  }

  useEffect(()=>{
    checkIfLogin()
  },
  [])

  let checkIfLogin = () =>{
    if(localStorage.getItem("apiKey")!=null){
      setLogin(true)
    }else{
      setLogin(false)
    }
  }

  let disconnect = () =>{
    localStorage.removeItem("apiKey")
    setLogin(false)
    navigate("/login")
  }

  return (
    <div className="App">
      <nav>
        <ul>
          {!login && <li><Link to="/register">Register</Link></li>}
          {!login &&<li><Link to="/login" >Log In</Link></li>}
          {login && <li><Link to="/viajes">Viajes</Link></li>}
          {login &&<li><Link to="#" onClick={disconnect}>Disconnect</Link></li>}
        </ul>
      </nav>
      {notification!=="" && (
        <div className='notification'>      {notification}
          <span className='close-btn' onClick={()=>{setNotification("")}}>X</span>
        </div>
      )}
      <h1>My gifts</h1>
      <Routes>
        <Route path="/register" element={<RegisterUserComponent/>}></Route>
        <Route path="/login" element={<LoginUserComponent setLogin={setLogin}/>}></Route>
        <Route path="/viajes" element={<ViajesComponent createNotification={createNotification}/>}></Route>
      </Routes>
    </div>
  );
}

export default App;