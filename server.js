'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const dns = require("dns");
const Uri = require("./models/Uri");

mongoose.Promise = global.Promise; 

const cors = require('cors');

const app = express();

// Basic Configuration 
const port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect("mongodb+srv://Rupz_Koomar:"+ process.env.ATLAS_PW + "@cluster0-p7ht7.mongodb.net/test?retryWrites=true" , err => console.log(err || "Mongoose connection successful"));

const db = mongoose.connection; 
db.once("connect" , () => console.log("DB connection established"));
db.on("error", err => {
  if(err){
  console.log(err); }});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use(bodyParser.urlencoded({"extended":false}));
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => res.sendFile(process.cwd() + '/views/index.html'));


//initializing counter
let counter; 
Uri.find({}) .exec()
.then(docs => {
  counter = docs.length-1; 
})
.catch(err => console.log("error ", err));

// your first API endpoint... 
app.post("/api/shorturl/new" , (req, res) => {
  let url = req.body.url.split("www.").pop(); //striping out wwww. part of the url if present to avoid duplication 
  url = url.split("//").pop(); //stiping out http:// part of the url if present to avoid duplication
  dns.lookup(url.split("/").shift() , err => {
  if(err)
  { 
    res.status(403).json({"error":"invalid URL"});
    return; 
  }
    
    Uri.findOne({"originalURI":url}) .exec()
      .then(doc => { 
            if(!doc)
            { 
              new Uri({
                "originalURI":url,
                "shortendURI":++counter 
              }) .save()
              .then(doc => { res.status(200).json({
                "original_url":req.body.url,
                "short_url":counter
              })         
               }) 
              return;  
            }
           res.status(200).json({
             "original_url":req.body.url,
             "short_url":doc.shortendURI
           }); 
          })
    .catch(err => res.status(500).json({"error":err}));
  });
});

app.get("/api/shorturl/:short_url" , (req , res , next)  => {
  
  if (!isNumeric(req.params.short_url))
  {
    res.status(500).json({"error":"Wrong Format"});
    return; 
  }
  Uri.findOne({"shortendURI":req.params.short_url}) . exec()
  .then(doc =>{
        if (!doc)
        { 
          res.status(500).json({"error":"No short url found for given input"});
          return; 
        } 
      
     res.redirect("https://www." + doc.originalURI );
      return; 
  })
  .catch(err => res.status(500).json({"error":err})); 
});


app.get("*", (req , res) => {
  res.status(500).send('<pre style="word-wrap: break-word; white-space: pre-wrap;">Not found</pre>');
});



const listener = app.listen(port, () => console.log("listening to port " , listener.address().port , "..."));


//After learning REGEX will use it instead of this function 
function isNumeric (str)
{
  for(let i = 0 ; i <= str.length-1 ; i++)
  {
   let charCode = str.charCodeAt(i);
   if (charCode < 48 || charCode > 57)
   {
     return false;
   }}
  return true; 
}




//dns.lookup("http://reddit.com/red".split("/").shift(),(err) =>{ if(err){console.log(err); return;}console.log("site found")});


