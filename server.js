const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http=require('http');
const server = http.Server(app)
const io = require('socket.io')(server)

let serverSocketHost = "127.0.0.1";
if (process.env.SERVER_SOCKET_HOST){
    serverSocketHost = process.env.SERVER_SOCKET_HOST;
}

let serverProxyHost = "127.0.0.1";
if (process.env.SERVER_PROXY_HOST){
    serverProxyHost = process.env.SERVER_PROXY_HOST;
}

let serverPort = 8080;
if (process.env.SERVER_PORT){
    serverPort = process.env.SERVER_PORT;
}

let proxyPort = 9000;
if (process.env.PROXY_PORT){
    proxyPort = process.env.PROXY_PORT;
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.get('/', function (req, res) {
   res.sendFile('index.html', { root: __dirname })
})

app.get('/json', function (req, res) {
   res.status(200).json({"message":"ok"})
})

var sock;

io.on('connection', (socket) =>{
    sock = socket;
    console.log(`connected ${socket.id}`)
    io.emit('news','from server')
 })

server.listen(serverPort, serverSocketHost, function () {
 console.log('socket io listen on ' + serverSocketHost+ ":"+serverPort)
})


http.createServer(function (req, res) {
    const { headers, method, url } = req;
    var id = uuidv4();

    console.log("listen to ",id.trim())
  
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        //console.log(JSON.parse(data).todo); // 'Buy the milk'
        sock.emit('request',{
            id : id,
            headers : headers,
            method : method,
            url : url,
            body : data
        });
        //res.end();
    })

    sock.on(id, (response) =>{        
        console.log(response)
        console.log("receive from remote")
        console.log("body = ",data)
        res.writeHead(response.status,response.headers)
        res.write(response.data);
        res.end();
     })    
  }).listen(proxyPort,serverProxyHost);

  console.log("proxy serveur listen " + serverProxyHost+":"+proxyPort)

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }