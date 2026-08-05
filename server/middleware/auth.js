const jwt = require("jsonwebtoken");
function verifyToken(req,res,next){
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const token = bearer[1];
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }else{
        res.sendStatus(403);
    }

}

module.exports ={
    verifyToken
}