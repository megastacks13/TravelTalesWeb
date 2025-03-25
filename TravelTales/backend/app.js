import express from 'express'
import cors from 'cors'
import routerUsers from './routers/routerUsers.js'
import routerViajes from './routers/routerViajes.js'

const port = 4006
let app = express()
app.use(cors())
app.use(express.json())

app.use("/viajes",routerViajes)
app.use("/users",routerUsers)

app.listen(port, () => {
    console.log("Listening in port "+port)
})