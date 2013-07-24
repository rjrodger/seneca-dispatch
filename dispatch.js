/* Copyright (c) 2013 Richard Rodger, MIT License */
"use strict";


var httpproxy = require('http-proxy')
var _         = require('underscore')
var nid       = require('nid')


module.exports = function( options ) {
  var seneca = this
  var name   = 'dispatch'




  options = seneca.util.deepextend({
    pattern:function( req ){ return { url:req.url } }
  },options)
  


  var router = seneca.util.router()
  var proxymap = {} 



  seneca.add({role:name,cmd:'add',item:'proxy'},add_proxy)
  seneca.add({role:name,cmd:'add',item:'route'},add_route)



  function add_proxy( args, done ) {
    var server = {
      id:   args.id,
      host: args.host,
      port: args.port
    }

    proxymap[server.id] = new httpproxy.HttpProxy({
      target: {
        host: server.host,
        port: server.port
      }
    })

    done(null,server)
  }


  
  function add_route( args, done ) {
    router.add(args.pattern,args.server)
    done()
  }


  seneca.add({init:name}, function( args, done ){
    //this.act('role:dispatch,cmd:add,item:proxy',{id:'aaa',host:'localhost',port:3001})
    //this.act('role:dispatch,cmd:add,item:proxy',{id:'bbb',host:'localhost',port:3002})

    //this.act('role:dispatch,cmd:add,item:route',{pattern:{url:'/foo',domain:'localhost'},server:'aaa'})
    //this.act('role:dispatch,cmd:add,item:route',{pattern:{url:'/bar',domain:'localhost'},server:'bbb'})
  })



  seneca.act('role:web',{use:function(req,res,next){
    var rd = options.pattern( req )
    console.dir(rd)

    var id = router.find( rd )
    console.log('id='+id)
    if(!id) return next(404);

    var proxy = proxymap[id]
    console.log('p='+proxy)
    if(!proxy) return next(404);

    proxy.proxyRequest(req, res)
  }})


  return {
    name: name
  }
}
