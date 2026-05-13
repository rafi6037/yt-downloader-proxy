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
 * Download route using Cobalt API
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

    /**
     * Cobalt API request
     */
    const response = await fetch(
      'https://api.cobalt.tools/api/json',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          vCodec: 'h264',
          vQuality: '720',
          filenamePattern: 'pretty',
          isAudioOnly: format === 'mp3'
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error || 'Cobalt API error'
      });
    }

    /**
     * Success
     */
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
