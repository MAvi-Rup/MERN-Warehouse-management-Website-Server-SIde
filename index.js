const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c9qzr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productsCollection = client.db('gadget-db').collection('products');
        const myItemCollection = client.db('gadget-db').collection('myitem')

        //All Products Find

        app.get('/products' , async(req,res)=>{
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products);
        })

        // Get a Single Products

        app.get('/products/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const product = await productsCollection.findOne(query)
            res.send(product)
        })

        //update user

        app.put('/products/:id', async(req,res)=>{
            const id = req.params.id;
            const updatedUser = req.body;
            // console.log(updatedUser)
            const filter = {_id:ObjectId(id)}
            const options = {upsert:true}
            const updateProduct = {
                $set:{
                    quantity:updatedUser.newQuantity
                }

            };
            const result = await productsCollection.updateOne(filter,updateProduct,options)
            res.send(result)



        })

        //Delete User 
        app.delete('/products/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        //Add New Service 

        app.post('/products',async(req,res)=>{
            const newProduct = req.body;
            // console.log(newProduct)
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })

        //My Item collection 
        app.post('/myitem', async(req,res)=>{
            const myItem = req.body;
            const result = await myItemCollection.insertOne(myItem)
            res.send(result)
        })

        //Get My Items
        app.get('/myitem',async(req,res)=>{
            const email = req.query.email;
            const query ={email:email}
            const cursor = myItemCollection.find(query)
            const orders = await cursor.toArray()
            res.send(orders)
        })

    }finally{

    }
}
run().catch(console.dir)


app.get('/', (req,res)=>{
    res.send('Warehouse Management Server Started')
})

app.listen(port,()=>{
    console.log("Server Started at port", port)
})