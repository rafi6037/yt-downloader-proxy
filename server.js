const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Root route
 */
app.get('/', (req, res) => {
  res.send('YT Downloader Proxy Running 🎵');
});

/**
 * Download proxy route
 */
app.get('/download', async (req, res) => {
  try {
    const { url, format, stime, etime } = req.query;

    // Validate URL
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

    // Build API params
    const params = new URLSearchParams({
      url,
      format: format || 'mp3'
    });

    if (stime) {
      params.set('stime', stime);
    }

    if (etime) {
      params.set('etime', etime);
    }

    const apiUrl =
      `https://www.yt2mp3converter.net/apis/fetch.php?${params.toString()}`;

    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Calling external API');
    console.log(apiUrl);

    // Timeout controller
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 20000);

    // Fake browser headers
    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

        'Accept':
          'application/json, text/plain, */*',

        'Accept-Language':
          'en-US,en;q=0.9',

        'Cache-Control':
          'no-cache',

        'Pragma':
          'no-cache',

        'Referer':
          'https://www.yt2mp3converter.net/',

        'Origin':
          'https://www.yt2mp3converter.net'
      }
    });

    clearTimeout(timeout);

    const rawText = await response.text();

    console.log('Status:', response.status);
    console.log(
      'Response:',
      rawText.substring(0, 300)
    );

    // API error
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `API error ${response.status}`,
        details: rawText.substring(0, 200)
      });
    }

    // Parse JSON safely
    let data;

    try {
      data = JSON.parse(rawText);
    } catch (jsonError) {
      return res.status(500).json({
        success: false,
        error: 'Invalid JSON returned by API',
        details: rawText.substring(0, 300)
      });
    }

    // Validate download link
    if (!data.download) {
      return res.status(500).json({
        success: false,
        error: 'No download link returned',
        response: data
      });
    }

    // Success response
    return res.json({
      success: true,
      title: data.title || 'Your Song',
      duration: data.duration || '',
      filesize: data.filesize || '',
      download: data.download
    });

  } catch (error) {
    console.error('SERVER ERROR');
    console.error(error);

    // Timeout error
    if (error.name === 'AbortError') {
      return res.status(408).json({
        success: false,
        error: 'Request timed out'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error'
    });
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});
