const express=require('express');
const cors=require('cors');
const app = express();
const port=process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

app.get('/',(req,res)=>{
    res.send("Server Running");
})


app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kfnsc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    //Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //Send a ping to confirm a successful connection
    await client.db("Support").command({ ping: 1 });
   console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const supportCollection = client.db("Support").collection("Ticket");

    
    app.post('/support/create_ticket', async (req, res) =>{
        const { userID, date, deviceID, queryText } = req.body;
        const lastTicket = await supportCollection.findOne(
            { userID },
            { sort: { date: -1 } }
          );
          if (!lastTicket || new Date() - lastTicket.date > 30 * 60 * 1000) {
            const result = await supportCollection.insertOne({ userID, date, deviceID, queryText });
            
            res.status(200).json({ data: { _id: result.insertedId.toString() } });
          
          } else {
            res.status(409).json({
              message: 'You have already placed a support ticket. Please wait at least one hour before sending another request',
            });
          }
          
    })
  }


  catch (error) {
    console.error(error);
  }
 
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log(`Server running on ${port}`);
})