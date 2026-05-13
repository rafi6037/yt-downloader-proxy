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

    const requestBody = {
      url: url,
      downloadMode: 'auto',
      audioOnly: format === 'mp3'
    };

    console.log('Sending:', requestBody);

    const response = await fetch(
      'https://co.wuk.sh/api/json',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();

    console.log('API Response:', data);

    if (!response.ok || data.status === 'error') {
      return res.status(500).json({
        success: false,
        error:
          data.text ||
          data.error ||
          'Download failed'
      });
    }

    if (!data.url) {
      return res.status(500).json({
        success: false,
        error: 'No download URL returned',
        response: data
      });
    }

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

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});
