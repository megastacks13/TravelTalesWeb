const express = require('express')
const cors = require("cors")
const port = 4006
let app = express()
app.use(cors())
app.use(express.json())

const routerViajes = require("./routers/routerViajes") 
const routerUsers = require("./routers/routerUsers") 

app.use("/viajes",routerViajes)
app.use("/users",routerUsers)

app.listen(port, ()=>{
    console.log("Listening in port "+port)
})