var express = require('express')
var serveStatic = require('serve-static')
var app = express()

app.use('/', serveStatic('./'));

app.listen(1666, function () {
	console.log('Server listening on port 1666!')
})
