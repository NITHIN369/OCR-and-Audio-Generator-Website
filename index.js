const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const tesseract = require("node-tesseract-ocr");
const bodyParser = require("body-parser");
const translate = require("translate-google");
const gTTS = require("gtts");
app.use(bodyParser.urlencoded({ extended: true }));
const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});
app.post("/extracttext", upload.single("image"), async (req, res) => {
  config.lang = req.body.langs;
  text = await tesseract.recognize(req.file.path, config);
  console.log(req.body.langs.substr(0, 2));
  console.log(req.body.translang);
  console.log(text);
  translate(text, {
    from: req.body.langs.substr(0, 2),
    to: req.body.translang,
  })
    .then((t) => {
      gtts = new gTTS(t, req.body.translang);
      // m1=__dirname+"/views/Voice" + Date.now() + ".mp3"
      m1="Voice" + Date.now() + ".mp3"
      gtts.save(m1, function (err, result) {
        if (err) {
          throw new Error(err);
        }
        res.download("./" + m1, (err1) => {
          if (err1) {
            res.send(err1);
          }
        });
        console.log("Text to speech converted!");
      });
      console.log(path.resolve(m1));
      
    })
    .catch((e) => {
      console.log(e.message);
    });
});
app.listen(5000, () => {
  console.log("Started listening at port 5000");
});
