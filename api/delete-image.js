const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { public_id } = req.body;

    // Validate input
    if (!public_id) {
      return res.status(400).json({ error: 'Missing public_id' });
    }

    // Only allow deleting from gallery folder
    if (!public_id.startsWith('gallery/')) {
      return res.status(403).json({ error: 'Can only delete from gallery folder' });
    }

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      return res.status(200).json({ 
        success: true, 
        message: 'Image deleted successfully' 
      });
    } else {
      return res.status(400).json({ 
        error: 'Failed to delete image', 
        details: result 
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({ 
      error: 'Failed to delete image',
      message: error.message 
    });
  }
};