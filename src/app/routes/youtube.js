const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/videoTitle', async (req, res) => {
    const videoId = req.query.videoId;
    const apiKey = process.env.YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  
    try {
      const response = await axios.get(apiUrl);
      const videoData = response.data;
      if (videoData.items && videoData.items.length > 0) {
        res.json({ title: videoData.items[0].snippet.title });
      } else {
        res.status(404).send('Video not found');
      }
    } catch (error) {
    }
  });
  
const { exec } = require('child_process');

router.get('/getSummary', (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    console.error('Video ID is missing');
    return res.status(400).send('Video ID is required');
  }

  try {
    const scriptPath = 'api/main.py'; // Use an absolute path
    const command = `python3 ${scriptPath} summarize_transcript ${videoId}`;
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Exec error:', error);
        return res.status(500).send('Server Error');
      }
      if (stderr) {
        console.warn('Stderr:', stderr);
      }
      console.log('Python script output:', stdout);
      res.send(stdout);
    });
  } catch (err) {
    console.error('Try-catch error:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/getChapters', (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    console.error('Video ID is missing');
    return res.status(400).send('Video ID is required');
  }

  try {
    const scriptPath = 'api/main.py'; // Use an absolute path
    const command = `python3 ${scriptPath} chapters_summary ${videoId}`;
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Exec error:', error);
        return res.status(500).send('Server Error');
      }
      if (stderr) {
        console.warn('Stderr:', stderr);
      }
      console.log('Python script output:', stdout);
      res.send(stdout);
    });
  } catch (err) {
    console.error('Try-catch error:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/getQuestions', (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    console.error('Video ID is missing');
    return res.status(400).send('Video ID is required');
  }

  try {
    const scriptPath = 'api/main.py'; // Use an absolute path
    const command = `python3 ${scriptPath} generate_questions ${videoId}`;
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Exec error:', error);
        return res.status(500).send('Server Error');
      }
      if (stderr) {
        console.warn('Stderr:', stderr);
      }
      console.log('Python script output:', stdout);
      res.send(stdout);
    });
  } catch (err) {
    console.error('Try-catch error:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/embedVideoContent', (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) {
    console.error('Video ID is missing');
    return res.status(400).send('Video ID is required');
  }

  try {
    const scriptPath = 'api/main.py'; // Use an absolute path
    const command = `python3 ${scriptPath} embed_video ${videoId}`;
    console.log(`Executing command: ${command}`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Exec error:', error);
        return res.status(500).send('Server Error');
      }
      if (stderr) {
        console.warn('Stderr:', stderr);
      }
      console.log('Python script output:', stdout);
      res.send(stdout);
    });
  } catch (err) {
    console.error('Try-catch error:', err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;