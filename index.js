const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c9qzr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('gadget-db').collection('products');
        const myItemCollection = client.db('gadget-db').collection('myitem')
        const myMessageCollection = client.db('gadget-db').collection('message')


        //All Products Find

        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray();
            res.send(products);
        })

        // Get a Single Products

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query)
            res.send(product)
        })

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        //update product

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            // console.log(updatedUser)
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateProduct = {
                $set: {
                    quantity: updatedUser.newQuantity,
                    sold: updatedUser.updateSold
                }

            };
            const result = await productsCollection.updateOne(filter, updateProduct, options)
            res.send(result)



        })

        //Delete Product
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query)
            res.send(result)
        })

        //Add New Product

        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            // console.log(newProduct)
            const result = await productsCollection.insertOne(newProduct)
            res.send(result)
        })

        //My Item collection 
        app.post('/myitem', async (req, res) => {
            const myItem = req.body;
            const result = await myItemCollection.insertOne(myItem)
            res.send(result)
        })

     
        app.get('/myitem',verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email: email }
                const cursor = myItemCollection.find(query)
                const orders = await cursor.toArray()
                res.send(orders)
            }
        })
  
        //Delete A My Item
        app.delete('/myitem/:id', async (req, res) => {

            const email = req.query.email;
            const id = req.params.id;
            const query = { _id: ObjectId(id), email: email };
            const result = await myItemCollection.deleteOne(query)
            res.send(result)
        })
        //Message Databse

        app.post('/message', async (req, res) => {
            const newProduct = req.body;
            const result = await myMessageCollection.insertOne(newProduct)
            res.send(result)
        })


    } finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Warehouse Management Server Started')
})

app.listen(port, () => {
    console.log("Server Started at port", port)
})