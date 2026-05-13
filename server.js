const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('YT Downloader Proxy Running 🎵');
});

app.get('/download', async (req, res) => {
  try {
    const { url, format } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing YouTube URL'
      });
    }

    const body = {
      url: url,
      audioOnly: format === 'mp3'
    };

    console.log('Sending:', body);

    const response = await fetch(
      'https://api.cobalt.tools/',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    console.log('Response:', data);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.text || 'Cobalt error',
        details: data
      });
    }

    if (!data.url) {
      return res.status(500).json({
        success: false,
        error: 'No download URL found',
        details: data
      });
    }

    return res.json({
      success: true,
      title:
        data.filename ||
        'Your Download',
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
