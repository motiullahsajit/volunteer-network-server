const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const port = process.env.PORT || 5055;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2zggz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection error', err)
    const eventCollection = client.db("volunteer-net").collection("events");

    app.get('/events', (req, res) => {
        eventCollection.find({})
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.get('/event/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        eventCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    });


    app.post('/addEvent', (req, res) => {
        const newEvent = req.body;
        eventCollection.insertOne(newEvent)
            .then(result => {
                console.log('incerted count', result.insertedCount)
                res.send(result.insertedCount > 0)
            })
        // console.log('addin new ', newEvent)
    })

    //patch method
    app.patch('/update/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        eventCollection.updateOne({ _id: id },
            {
                $set: { name: req.body.name, price: req.body.price, quantity: req.body.quantity, description: req.body.description, imageURL: req.body.imageURL }
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
    })


    app.delete('/deleteEvent/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        // eventCollection.findOneAndDelete(req._id)
        console.log('delete this', id)
        eventCollection.findOneAndDelete({ _id: id })
            .then(document => {
                res.send('deleted')
            })
    })


    console.log('database connceted')
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
});





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})