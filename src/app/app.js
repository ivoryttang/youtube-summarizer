const dotenvResult = require('dotenv').config();
if (dotenvResult.error) {
  throw dotenvResult.error;
}
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


// Create Express app
const app = express();

// Apply middleware
app.use(cors()); // Enable CORS
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Import routes
const youtubeRoutes = require('./routes/youtube');
const chatRoutes = require('./routes/chat');

app.use('/youtube', youtubeRoutes);
app.use('/chat', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});