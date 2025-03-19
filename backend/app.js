const express = require('express')
const cors = require("cors")
const port = 4006
let app = express()
app.use(cors())
app.use(express.json())

const routerViajes = require("./routers/routerViajes") 

app.use("/viajes",routerViajes)

app.listen(port, ()=>{
    console.log("Listening in port "+port)
})