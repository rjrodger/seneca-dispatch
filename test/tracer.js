
var http   = require('http')

var seneca = require('seneca')()

seneca.use('..',{ pattern: function( req ) {
  var pat = {}
  pat.url    = req.url

  var host = req.headers['host']
  var c = host.indexOf(':')
  var domain = c < 0 ? host : host.substring(0,c)

  pat.domain = domain
  return pat
}})


var web = seneca.export('web')

http.createServer(function (req, res) {
  web(req,res,function(){
    res.writeHead(404)
    res.end()
  })
}).listen(8080)

console.log('listen 8080')
