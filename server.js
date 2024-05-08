const express = require('express');
const app = express();

// Define a route handler for "/v1/api/porsche"
app.get('/v1/api/porsche/:id', (req, res) => {
   console.log(req)
    // Respond with a message or perform some action
    res.status(200).json({Title:"hi"})
});


// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
