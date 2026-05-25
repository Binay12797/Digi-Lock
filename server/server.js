const express = require("express"); //imports the express framework
const server = express();           //creates the server endpoint
const PORT = 3000;                  //defines the port 

server.get("/",(req,res)=>{         //check for req and sends res to the url
    res.send("server online");
});

server.listen(PORT,()=>{             //listens at the port for req
    console.log(`server is running at port ${PORT}`);
});