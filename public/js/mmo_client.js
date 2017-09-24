var server = io();

server.on('logout', () => {
  window.location = '/logout';
});

server.on('login', () => {
  window.location = '/login';
});
