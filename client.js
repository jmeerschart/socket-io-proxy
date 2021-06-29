const io = require("socket.io-client");
const https = require('https')

var hostname = "httpbin.org"
if (process.env.HOST_NAME){
    hostname = process.env.HOST_NAME;
}

var server = "localhost"
if (process.env.SERVER){
    server = process.env.SERVER;
}

var port = 8080
if (process.env.PORT){
    port = process.env.PORT;
}

console.log(` redirect to local url https://${hostname}` )
console.log(` connect to websocket ${server}:${port}` )

var socket = io.connect(`http://${server}:${port}`, {reconnect: true});

socket.on('connect', function(request){
    console.log("connected")
});

 socket.on('request', function(request){

    const options = {
        hostname: hostname,
        port: 443,
        path: request.url,
        method: request.method,
        data : request.body,
        rejectUnauthorized: false,
        requestCert: true,
        agent: false
      }

      const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`)
      
        res.on('data', d => {
          //process.stdout.write(d)
          console.log(d)
          console.log("=== data =",request.id)
          socket.emit(request.id,{
              status : res.statusCode,
              data : d,
              headers : res.headers
          });
        })
      })
      req.on('error', error => {
        console.error(error)
      })
      
      req.write(request.body);
      req.end()

    console.log(request)
 });  