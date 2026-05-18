const http = require("http");
const app = require("./app");
const { initSocket } = require("./socket");
const { port } = require("./config/env");

const server = http.createServer(app);

initSocket(server);

server.listen(port, () => {
  console.log(`INTEGRITY backend running on port ${port}`);
});

module.exports = server;
