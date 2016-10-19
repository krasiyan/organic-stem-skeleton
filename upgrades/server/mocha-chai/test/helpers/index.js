/**
 * define CELL_MODE if not present
 */
process.env.CELL_MODE = process.env.CELL_MODE || '_test'

var path = require('path')
var chai = require('chai')

global.expect = chai.expect

var test = global.test = {}
var variables = test.variables = {
  cell: null,
  dna: null,
  httpendpoint: 'http://127.0.0.1:13371',
  apiendpoint: 'http://127.0.0.1:13371/api',
  uploadsDir: path.join(process.cwd(), '/test/uploads')
}

require('./clean-uploads')
require('./uploads')

test.initTestEnv = function (done) {
  var loadDna = require('organic-dna-loader')
  loadDna(function (err, dna) {
    if (err) return done(err)

    test.variables.dna = dna

    test.cleanUploads(function (err) {
      if (err) return done(err)
      test.cleanDB(dna.server.database.name, done)
    })
  })
}

test.startServer = function (next) {
  test.initTestEnv(function (err) {
    if (err) return next(err)
    var cell = variables.cell = require('../../server').start()
    cell.plasma.on(['ApiRoutesReady', 'SiteRoutesReady'], function (err) {
      if (err instanceof Error) return next(err)
      next && next()
    })
  })
}

test.stopServer = function (next) {
  variables.cell.stop(next)
}

test.connectDB = function (next) {
  test.initTestEnv(function (err) {
    if (err) return next(err)
    var dbName = test.variables.dna.server.database.name
    process.nextTick(function () {
      require('mongoose').connect('localhost', dbName, next)
    })
  })
}

test.disconnectDB = function (next) {
  require('mongoose').disconnect(next)
}
