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
    const { url, format, stime, etime } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Missing YouTube URL'
      });
    }

    const params = new URLSearchParams({
      url,
      format: format || 'mp3'
    });

    if (stime) params.set('stime', stime);
    if (etime) params.set('etime', etime);

    const apiUrl =
      `https://www.yt2mp3converter.net/apis/fetch.php?${params.toString()}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();

    return res.json(data);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
