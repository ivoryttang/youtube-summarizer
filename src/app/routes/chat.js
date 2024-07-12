const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/completion', async (req, res) => {
    const { input } = req.body; // Assuming 'input' contains the message text
  
    try {
      const completion = {"test":"test"}
  
      // Send the generated completion back to the client
      res.json( completion );
    } catch (error) {
      console.error('Error handling chat message:', error);
      res.status(500).send('Server error');
    }
});


module.exports = router;