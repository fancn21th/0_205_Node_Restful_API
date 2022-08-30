const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");

// HTTP server
const httpServer = http.createServer(function (req, res) {
  requestHandler(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
  console.log("The HTTP server is running on port " + config.httpPort);
});

// HTTPS server
const httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};

const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  requestHandler(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
  console.log("The HTTPS server is running on port " + config.httpsPort);
});

// shared request handler
const requestHandler = function (req, res) {
  const parsedUrl = url.parse(req.url, true);

  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, "");

  const queryStringObject = parsedUrl.query;

  const method = req.method.toLowerCase();

  const headers = req.headers;

  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  // not to execute if no body is sent
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });

  req.on("end", function () {
    buffer += decoder.end();

    const handler = router[trimmedPath]
      ? router[trimmedPath]
      : handlers.notFound;

    const context = {
      trimmedPath: trimmedPath,
      queryStringObject: queryStringObject,
      method: method,
      headers: headers,
      payload: buffer,
    };

    handler(context, function (statusCode, payload) {
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      payload = typeof payload == "object" ? payload : {};

      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

// Define all the handlers
const handlers = {};

// foo handler
handlers.foo = function (data, callback) {
  callback(200, { message: "hi handler" });
};

// Not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// Define the request router
const router = {
  foo: handlers.foo,
};
