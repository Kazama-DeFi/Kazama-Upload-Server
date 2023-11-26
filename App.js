const express = require('express');
const app = express();
const cors = require("cors");
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Kazama mongoose api user schema
const User = require('./models/userModel');

// Connect to kazama mongoose api
const KAZAMA_MONGOOSE_CONNECTION_STRING = STRING;
const mongoURI = KAZAMA_MONGOOSE_CONNECTION_STRING;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to KAZAMA Mongoose API');
  })
  .catch((err) => {
    console.error('Error connecting to KAZAMA Mongoose API:', err);
  });

app.use(cors());
// Below is for later
//
// const corsOrigin = 'http://localhost:3000';
// app.use(cors({
//   origin:[corsOrigin],
//   methods:['GET','POST'],
//   credentials: true 
// })); 

// Serve static files from a directory
app.use('/profiles/avatars', express.static('/root/server/assets/profiles/avatars'));

const imageUploadPath = '/root/server/assets/profiles/avatars';

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, imageUploadPath)
  },
  filename: function(req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  }
})

const imageUpload = multer({storage: storage})

app.post('/image-upload', imageUpload.array("kazama-user-avatar"), async (req, res) => {
    console.log('POST request received to /image-upload.');
    console.log('Axios POST body: ', req.body);
  
    const address = req.body.address;
    const newImageFilename = req.files[0].filename;
  
    try {
      // Retrieve the user from the kazama mongoose server
      const user = await User.findOne({ address: address });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if the user has a custom avatar (not the default URL)
      if (user.avatarImage && !user.avatarImage.startsWith('https://assets.kazamaswap.finance/profiles/avatars/default.jpg')) {
        // User has a custom avatar URL, delete the old image file
        const oldImageFilename = user.avatarImage.split('/').pop();
        const oldImagePath = `${imageUploadPath}/${oldImageFilename}`;
        
        // Check if the old image file exists before attempting to delete it
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

    // Validate the file type (server-side validation)
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const newImageType = req.files[0].mimetype;
    
    if (!allowedFileTypes.includes(newImageType)) {
      console.log('Denied: Not jpg, png or gif')
      return res.status(400).json({ error: 'Invalid file type. Please upload a jpg, png, or gif file.' });
    }
  
      // Update the avatarImage URL with the new image filename
      user.avatarImage = `https://assets.kazamaswap.finance/profiles/avatars/${newImageFilename}`;
      await user.save();
  
      res.send('Image uploaded and user profile updated.');
    } catch (error) {
      console.error('Error uploading image and updating user profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

const port = 4000;
app.listen(port, process.env.IP, function(){
  console.log(`Server is running on port ${port}`);
});
