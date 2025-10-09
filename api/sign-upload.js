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
    const { folder, public_id } = req.body;

    // Validate input
    if (!folder || !public_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: folder and public_id' 
      });
    }

    // Only allow teamMembers and gallery folders
    if (folder !== 'teamMembers' && folder !== 'gallery') {
        return res.status(403).json({ error: 'Unauthorized folder' });
    }

    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Parameters to sign
    const params_to_sign = {
      timestamp: timestamp,
      folder: folder,
      public_id: public_id,
      overwrite: folder === 'teamMembers',
      invalidate: true,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params_to_sign,
      process.env.CLOUDINARY_API_SECRET
    );

    // Return signature and parameters
    return res.status(200).json({
      signature: signature,
      timestamp: timestamp,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
};