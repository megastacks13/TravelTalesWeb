import express from 'express'
import cors from 'cors'
import routerUsers from './routers/routerUsers.js'
import routerViajes from './routers/routerViajes.js'
import jwt from 'jsonwebtoken'
import activeApiKeys from './activeApiKeys.js'

const port = 4006
let app = express()
app.use(cors())
app.use(express.json())

app.use('/', (req, res, next) => {
    if (req.query.apiKey != null)
        return res.render('inicio')
    next()
});


app.use(["/viajes"],(req,res,next)=>{
    console.log("Middleware execution")

    let apiKey = req.query.apiKey

    if(apiKey==undefined)
        return res.status(401).json({error:"No apiKey"})
    let infoApiKey=null
    try{
        infoApiKey=jwt.verify(apiKey,"secret")
    }catch{
        return res.status(401).json({error:"invalid apiKey"})
    }
    

    if(infoApiKey==undefined||activeApiKeys.indexOf(apiKey)==-1)
        return res.status(401).json({error:"invalid apiKey"})

    req.infoApiKey=infoApiKey
    next()
})

app.use("/viajes",routerViajes)
app.use("/users",routerUsers)

app.listen(port, () => {
    console.log("Listening in port "+port)
})