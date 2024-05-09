const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB setup
const password = encodeURIComponent('EEj!9R@La7jh.Lk');
const url = `mongodb+srv://iiheart:${password}@clusterporsche.vjak4my.mongodb.net/`;

// Create a new MongoClient instance with the URL
const client = new MongoClient(url);
const app = express();


// Middleware function to log incoming requests
app.use((req, res, next) => {
    console.log('The middleware received the request:', req.method, req.url);
    next();
});

app.use(express.json());

const PORT = process.env.PORT || 5000;

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader);  // Debug output

    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send('Token not provided');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send('Token is invalid or expired');
        }
        req.user = user;
        next();
    });
}

//connecting to DataBase


client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        const db = client.db('Porsche'); // Get the database instance


//searhing for products

        app.get('/products', (req, res) => {
            db.collection('Products')
                .find()
                .toArray() // Converts cursor to an array of documents
                .then(products => {
                    res.status(200).json(products); // Sends JSON response with products array
                })
                .catch(err => {
                    console.error('Error fetching products:', err);
                    res.status(500).json({ error: "Could not fetch the products" });
                });
        });

        app.get('/products/search', async (req, res) => {
            const searchQuery = req.query.q; // Retrieve the search keyword from query parameters
        
            try {
                const products = await db.collection('Products').find({
                    Category: { $regex: new RegExp(searchQuery, 'i') } // Search by Category, case-insensitive
                }).toArray();
                res.status(200).json(products); // Send the matched products as JSON
            } catch (err) {
                console.error('Error searching for products:', err);
                res.status(500).json({ error: "Could not complete the search" });
            }
        });


        
//register 

        app.post('/register', async (req, res) => {
            const { Email, Password, UserName, Gender, Birthday, City } = req.body;
            try {
                const existingUser = await db.collection('Customers').findOne({ UserName });
                if (existingUser) {
                    return res.status(409).send('User already registered, please log in.');
                }
                const newUser = { Email, Password, UserName, Gender, Birthday, City };
                await db.collection('Customers').insertOne(newUser);
                res.status(201).send('User registered successfully');
            } catch (err) {
                console.error('Failed to register user:', err);
                res.status(500).send('Internal server error');
            }
        });
    

        console.log('JWT_SECRET:', process.env.JWT_SECRET);


//login

        app.post('/login', async (req, res) => {
            const { UserName, Password } = req.body;

            try {
                // Attempt to find the user in both Customers and Admins collections
                let user = await db.collection('Customers').findOne({ UserName });
                let isAdmin = false;  // Flag to check if the user is an admin

                // If not found in Customers, try Admins
                if (!user) {
                    user = await db.collection('Admins').findOne({ UserName });
                    isAdmin = true;  // User is found in Admins collection
                }

                // If user is not found in either collection
                if (!user) {
                    return res.status(404).send('User not found.');
                }

                // Check password (consider using bcrypt for hashing in production)
                if (user.Password === Password) {
                    // Generate token for both admin and customer
                    const token = jwt.sign(
                        { userId: user._id, UserName: user.UserName, isAdmin },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    // Return success response with token
                    return res.json({
                        message: 'Login successful!',
                        token: token
                    });

                } else {
                    return res.status(401).send('Invalid Password');
                }
            } catch (err) {
                console.error('Login error:', err);
                return res.status(500).send('Internal server error');
            }
        });


//add products
        app.post('/admin/productsAdd', authenticateToken, async (req, res) => {
            const { Category, Model, Color, Year, StockQuantity ,Price } = req.body;

            try {
                if (!req.user.isAdmin) {
                    return res.status(403).send('Access denied: Requires admin privileges');
                }

                // Define a query to check if the product already exists
                const query = { Category, Model, Color, Year };

                // Attempt to find an existing product that matches the query
                const existingProduct = await db.collection('Products').findOne(query);

                if (existingProduct) {
                    // Increment the stock quantity by one and convert it back to a string
                    const newStockQuantity = (parseInt(existingProduct.StockQuantity, 10) + 1).toString();

                    // Update the product with the new stock quantity as a string
                    await db.collection('Products').updateOne(
                        { _id: existingProduct._id }, 
                        { $set: { StockQuantity: newStockQuantity } }
                    );
                    res.status(200).send('Product stock quantity incremented successfully');
                } else {
                    // Create a new product entry 
                    const newProduct = { 
                        Category, 
                        Model, 
                        Color, 
                        Year, 
                        StockQuantity,  
                        Price 
                    };
                    await db.collection('Products').insertOne(newProduct);
                    res.status(201).send('New product added successfully, stock quantity updated.');
                }
            } catch (error) {
                console.error('Error in managing product:', error);
                res.status(500).json({ error: error.message });
            }
        });



//update product

        app.put('/admin/productsUpdate', authenticateToken, async (req, res) => {
            const { Category, Model } = req.body;  // Get matching criteria from request body
            const productUpdates = req.body.updates;  // Get update fields from request body

            try {
                // Check if the user is an admin
                if (!req.user.isAdmin) {
                    return res.status(403).send('Access denied: Requires admin privileges.');
                }

                // Define the filter for the product to update
                const filter = { Category, Model };

                // Perform the update operation
                const updatedProduct = await db.collection('Products').updateOne(
                    filter,
                    { $set: productUpdates }
                );

                // Check if any document was actually updated
                if (updatedProduct.matchedCount === 0) {
                    return res.status(404).send('Product not found.');
                }

                res.json({ message: 'Product updated successfully.' });
            } catch (err) {
                console.error('Error updating product:', err);
                res.status(500).send('Internal server error');
            }
        });

        //delete product
        app.delete('/admin/productsDelete', authenticateToken, async (req, res) => {
            const { Category, Model } = req.body;
        
            try {
                if (!req.user.isAdmin) {
                    return res.status(403).send('Access denied: Requires admin privileges.');
                }
        
                // Build the query object for deletion
                const query = { Category, Model };
        
                // Perform the deletion operation
                const result = await db.collection('Products').deleteOne(query);
        
                // Check the result of the deletion
                if (result.deletedCount === 0) {
                    return res.status(404).send('Product not found.');
                }
        
                // If deletion was successful and some documents were deleted
                res.status(200).send('Product Deleted Successfully.');
            } catch (error) {
                console.error('Error deleting product', error);
                res.status(500).json({ error: error.message });
            }
        });
        
        //order 
        app.post('/customer/productsOrder', authenticateToken, async (req, res) => {
            const { Category, Model } = req.body; // Data to identify the product
        
            try {
        
                // Find the product and check the stock
                const product = await db.collection('Products').findOne({ Category, Model });
        
                if (!product) {
                    return res.status(404).send('Product not found.');
                }
        
                if (product.StockQuantity <= 0) {
                    return res.status(400).send('Product is out of stock.');
                }
        
                // Decrement the stock quantity by one
                const updatedStockQuantity = parseInt(product.StockQuantity, 10) - 1;
        
                // Update the product in the database
                await db.collection('Products').updateOne(
                    { _id: product._id },
                    { $set: { StockQuantity: updatedStockQuantity.toString() } } // Convert back to string if necessary
                );
        
                res.status(200).send('Order made successfully, stock quantity updated.');
            } catch (error) {
                console.error('Error making order:', error);
                res.status(500).send('Internal server error');
            }
        });
        

        app.get('/protected-route', authenticateToken, (req, res) => {
            res.send('This is a protected route');
        });
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });
    
