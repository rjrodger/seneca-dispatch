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


  var serverent = seneca.make('farm','server')
  var routeent  = seneca.make('farm','route')


  seneca.add({role:name,cmd:'add',item:'server'},add_server)
  seneca.add({role:name,cmd:'add',item:'route'},add_route)



  function add_server( args, done ) {
    serverent.make$({
      id$:   args.id,
      host: args.host,
      port: args.port

    }).save$(function( err, server ){
      if(err) return done(err);

      proxymap[server.id] = new httpproxy.HttpProxy({
        target: {
          host: server.host,
          port: server.port
        }
      })
      
      done()
    })
  }


  
  function add_route( args, done ){
    routeent.make$({
      id$:JSON.stringify(args.pattern),
      server:args.server

    }).save$( function( err, route ){
      router.add(args.pattern,args.server)
      done()
    })
  }


  seneca.add({init:name}, function( args, done ){
    seneca.act('role:util, cmd:define_sys_entity', {list:[serverent.canon$(),routeent.canon$()]})

    serverent.list$( function( err, all ){
      if(err) return done(err);

      _.each( all, function( server ){
        seneca.act({role:name,cmd:'add',item:'server',id:server.id,host:server.host,port:server.port})
      })

      routeent.list$( function( err, all ){
        if(err) return done(err);

        _.each( all, function( route ){
          seneca.act({role:name,cmd:'add',item:'route',pattern:JSON.parse(route.id),server:route.server})
        })

        done()
      })
    })
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
