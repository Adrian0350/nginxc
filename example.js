// Create full nginx.conf that serves 2 hosts, one for
// that serves static content and another that forwards
// requests locally to port 3000.

const nginxc = require('.');
const nc = nginxc();

nc
.dir('user', 'ascari')
.dir('worker_processes', '4')
.dir('pid', '/run/nginx.pid')
.cl('events', cl => {
  cl.directive('worker_connections', 768)
})
.clause('http', cl => {
  cl
  .directive('sendfile', 'on')
  .directive('tcp_nopush', 'on')
  .directive('tcp_nodelay', 'on')
  .directive('keepalive_timeout', 65)
  .directive('types_hash_max_size', 2048)
  .directive('include', '/etc/nginx/mime.types')
  .directive('default_type', 'application/octet-stream')
  .directive('access_log', '/var/log/nginx/access.log')
  .directive('error_log', '/var/log/nginx/error.log')
  .directive('gzip', 'on')
  .directive('gzip_disable', 'msie6')
  .clause('server', cl => {
    cl
    .directive('listen', '80')
    .directive('server_name', 'example.com')
    .directive('client_max_body_size', '50M')
    .directive('root', '/home/ascari/example.com')
    .location('/', cl => cl.directive('index', 'index.html'));
  })
  .clause('server', cl => {
    cl
    .directive('listen', '80')
    .directive('server_name', 'api.example.com')
    .directive('client_max_body_size', '50M')
    .location('/', cl => {
      cl.directive('proxy_pass', 'http://127.0.0.1:3000')
      cl.directive('proxy_http_version', '1.1')
      cl.directive('proxy_set_header', 'Upgrade $http_upgrade')
      cl.directive('proxy_set_header', `Connection 'upgrade'`)
      cl.directive('proxy_set_header', 'X-Forwarded-For $remote_addr')
    })
    .location('/objects', cl => {
      cl.directive('proxy_pass', 'http://127.0.0.1:3000')
      cl.directive('proxy_http_version', '1.1')
      cl.directive('proxy_set_header', 'Upgrade $http_upgrade')
      cl.directive('proxy_set_header', `Connection 'upgrade'`)
      cl.directive('proxy_set_header', 'X-Forwarded-For $remote_addr')
    });
  })
});

console.log(nc.toString());