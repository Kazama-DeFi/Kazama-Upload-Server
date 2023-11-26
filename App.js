const express = require('express');
const app = express();
const cors = require("cors");
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.post('/image-upload', imageUpload.array("kazama-user-avatar"), (req, res) => {
  console.log('POST request received to /image-upload.');
  console.log('Axios POST body: ', req.body);
  res.send('POST request recieved on server to /image-upload.');
})

const port = 4000;
app.listen(port, process.env.IP, function(){
  console.log(`Server is running on port ${port}`);
});
