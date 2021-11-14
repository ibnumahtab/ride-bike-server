// Express and Cors
const express = require('express');
const cors = require('cors');
const app = express();

// MongoDB
const { MongoClient, CURSOR_FLAGS } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

// DotENV
require('dotenv').config();

// Port
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgqlg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

async function run() {
	try {
		await client.connect();
		console.log('connect to database');
		const database = client.db('RideBike');
		const products = database.collection('products');
		const usersCollection = database.collection('users');
		const reviews = database.collection('reviews');
		const orders = database.collection('orders');

		//Get Api For Products
		app.get('/products', async (req, res) => {
			const cursor = products.find({});
			const byCicles = await cursor.toArray();
			res.send(byCicles);
		});

		//Get Api For Reviews
		app.get('/reviews', async (req, res) => {
			const cursor = reviews.find({});
			const reviewsInfo = await cursor.toArray();
			res.send(reviewsInfo);
		});

		//Get Api For Users
		app.get('/users', async (req, res) => {
			const cursor = usersCollection.find({});
			const users = await cursor.toArray();
			res.send(users);
		});

		//Get Api For Orders
		app.get('/orders', async (req, res) => {
			const cursor = orders.find({});
			const orderInfo = await cursor.toArray();
			res.send(orderInfo);
		});

		//Post Api For Products
		app.post('/products', async (req, res) => {
			const product = req.body;
			console.log('hit the post', product);
			const result = await products.insertOne(product);
			console.log(result);
			res.json(result);
		});

		//Post Api For Reviews
		app.post('/reviews', async (req, res) => {
			const review = req.body;
			console.log('hit the post', review);
			const result = await reviews.insertOne(review);
			console.log(result);
			res.json(result);
		});

		//Post Api For Users
		app.post('/users', async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			console.log(result);
			res.json(result);
		});


		app.put('/users', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await usersCollection.updateOne(
				filter,
				updateDoc,
				options
			);
			res.json(result);
		});


		app.put('/users/admin', async (req, res) => {
			const user = req.body;
			console.log(user);
			const filter = { email: user.email };
			const updateDoc = { $set: { role: 'admin' } };
			const result = await usersCollection.updateOne(filter, updateDoc);
			res.json(result);
		});

		//Delete Api For Orders
		app.delete('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await orders.deleteOne(query);
			res.json(result);
		});

		//delete api for products
		app.delete('/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await products.deleteOne(query);
			res.json(result);
		});

		//post api for orders
		app.post('/orders', async (req, res) => {
			const order = req.body;
			console.log('hit the post', order);
			const result = await orders.insertOne(order);
			console.log(result);
			res.json(result);
		});
		// update api for orders
		app.put('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const options = { upsert: true };
			const updateDoc = {
				$set: {
					status: true,
				},
			};
			const result = await orders.updateOne(query, updateDoc, options);
			res.json(result);
		});
		app.get('/users/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const user = await usersCollection.findOne(query);
			let isAdmin = false;
			if (user?.role === 'admin') {
				isAdmin = true;
			}
			res.json({ admin: isAdmin });
		});
	} finally {
		// await client.close()
	}
}
run().catch(console.dir);

app.get('/', async (req, res) => {
	res.send('Ride Bike Node Server Running!');
});

app.listen(port, () => {
	console.log('Server Running on Port Number', port);
});
