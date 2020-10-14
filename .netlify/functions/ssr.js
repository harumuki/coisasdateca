exports.handler = ({ path }, context, callback) => {
  if (/\.(js|css|ico|png|gif|jpg|jpeg|webp|svg)$/.test(path)) {
    return callback(null, {
      statusCode: 404,
      'Cache-Control': 'public, max-age=60'
    })
  }

  let statusCode = 200
  const headers = {}

  const req = {
    url: path.charAt(0) === '/' ? path : `/${path}`
  }

  const res = {
    set (header, value) {
      headers[header] = value
      return res
    },
    status (status) {
      statusCode = status
      return res
    },
    end () {
      callback(null, { statusCode, headers })
      return res
    },
    send (body) {
      callback(null, { statusCode, headers, body })
      return res
    }
  }

  process.env.STOREFRONT_BASE_DIR = __dirname
  try {
    const { ssr } = require('@ecomplus/storefront-renderer/functions/')
    ssr(req, res)
  } catch (err) {
    const fs = require('fs')
    // passsing directoryPath and callback function
    fs.readdir(__dirname, function (err, files) {
      // handling error
      if (err) {
        return console.log('Unable to scan directory: ' + err)
      }
      // listing all files using forEach
      callback(null, {
        statusCode: 500,
        body: err.stack + '\n\n' + JSON.stringify(files, null, 2)
      })
    })
  }
}
