const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Home route
 */
app.get('/', (req, res) => {
  res.send('YT Downloader Proxy Running 🎵');
});

/**
 * Download route
 */
app.get('/download', async (req, res) => {
  try {
    const { url, format } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing YouTube URL'
      });
    }

    const isYoutube =
      url.includes('youtube.com') ||
      url.includes('youtu.be');

    if (!isYoutube) {
      return res.status(400).json({
        success: false,
        error: 'Invalid YouTube URL'
      });
    }

    // Correct Cobalt request
    const body = {
      url: url,
      audioOnly: format === 'mp3',
      filenameStyle: 'pretty'
    };

    console.log('Sending to Cobalt:', body);

    const response = await fetch(
      'https://api.cobalt.tools/api/json',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    console.log('Cobalt Response:', data);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error || 'Cobalt API error',
        details: data
      });
    }

    // Success
    return res.json({
      success: true,
      title: data.filename || 'Your Download',
      download: data.url
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
