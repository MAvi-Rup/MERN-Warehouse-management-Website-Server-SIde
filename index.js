const express = require('express')

const app = express();
const port = process.env.port || 5000;

app.get('/', (req,res)=>{
    res.send('Warehouse Management Server Started')
})

app.listen(port,()=>{
    console.log("Server Started at port", port)
})