const http = require("http");

const server = http.createServer((req, res) => {
  res.end("hello world\n");
});

server.listen(3000, () => {
  console.log("server is running on port 3000");
});
