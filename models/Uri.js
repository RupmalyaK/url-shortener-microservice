const mongoose = require("mongoose"); 

module.exports = mongoose.model("Uri", 
                                new mongoose.Schema({

                                  "originalURI": {
                                    "type":String,
                                    "default":null
                                  },
  
                                  "shortendURI":{
                                  "type":String,
                                   "default":null
                                  } 
                             
                               })
                               );

