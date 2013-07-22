
var port = parseInt(process.argv[2])

var web = 
      require('seneca')()
      .use(function( options ){
        this.act('role:web',{use:function(req,res,next){
          res.writeHead(200)
          res.end(port+' '+req.url)
          console.log(port+' '+req.url)
        }})
      })
      .export('web')


require('http').createServer(function (req, res) {
  web(req,res,function(){
    res.writeHead(404)
    res.end()
  })
}).listen( port )

console.log('app '+port)
