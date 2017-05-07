# nginxc 

> A Tiny framework for building `nginx.conf` files programmatically.

## Install

`npm i nginxc --save`

## Usage

*see full example in ./example.js*

```
const nginxc = require('nginxc');
const nc = nginxc();

nc.clause('server', cl => {
  cl
  .directive('listen', '80')
  .directive('server_name', 'example.com')
  .directive('client_max_body_size', '50M')
  .directive('root', '/home/ascari/example')
  .location('/', cl => {
    cl
    .directive('index', 'index.html')
    .directive('error_page', '400 402 403 404 /404.html')
    .directive('error_page', '500 502 504 /500.html')
    .directive('error_page', '503 /503.html')
    .directive('rewrite', '/dashboard /index.html break')
    .location('/about', cl => {
      cl.directive('try_files', '/About.html =404');
    })
    .location('/search', cl => {
      cl.directive('try_files', '/Search.html =404')
    })
  });
});

console.log(nc.toString());
```

*Let's break it down*

##### 1) Require the nginxc module

`const nginxc = require('nginxc');`

##### 2) Create a instance of *NginxConfig*, a class that represents a *nginx.conf* file.

`const nc = nginxc();`

##### 3) We are creating a [virtual domain](https://www.linode.com/docs/web-servers/nginx/how-to-configure-nginx#server-virtual-domains-configuration) for the `sites-available/` directory, so we create a server clause. The callback is required and is executed synchronously, it will expose a server Clause instance as the first argument.

`nc.clause('server', cl => {`

##### 4) We configure the server clause by adding directives that specify the port and hostname as well as the root folder. A Directive takes only 2 arguments, the first is the name of the directive and the second is its value.

```
  cl
  .directive('listen', '80')
  .directive('server_name', 'example.com')
  .directive('client_max_body_size', '50M')
  .directive('root', '/home/ascari/example')
```

##### 5) Next, we create a Location clause at the root path. Here we configure the endpoint as well as add more Location clauses.

```
  .location('/', cl => {
    cl
    .directive('index', 'index.html')
    .directive('error_page', '400 402 403 404 /404.html')
    .directive('error_page', '500 502 504 /500.html')
    .directive('error_page', '503 /503.html')
    .directive('rewrite', '/dashboard /index.html break')
    .location('/about', cl => {
      cl.directive('try_files', '/About.html =404');
    })
    .location('/search', cl => {
      cl.directive('try_files', '/Search.html =404')
    })
  });
```

##### 5) Finally, call `toString()` to see return the nginx configuration.

`console.log(nc.toString());`

*outputs*

```
server {
  listen 80;
  server_name example.com;
  client_max_body_size 50M;
  root /home/ascari/example;

  location / {
    index index.html;
    error_page 400 402 403 404 /404.html;
    error_page 500 502 504 /500.html;
    error_page 503 /503.html;
    rewrite /dashboard /index.html break;
    location /about {
      try_files /About.html =404;
    }
    location /search {
      try_files /Search.html =404;
    }
  }
}

```

## API




**class** Directive
A instance is returned when calling `directive()` or `dir()` on a Clause.

 - **getter** name -> *{String}*
 - **getter** value -> *{String}*
 - **method** toString() -> *{String}*

**class** Clause
A instance is returned when calling `clause()` or `cl()` on a Clause.

 - **getter** name -> *{String}*
 - **getter** depth -> *{Number}*
 - **method** clause(name, callback) -> *{Clause}*
 - **method** directive(name, value) -> *{Clause}*
 - **method** location(path, callback) -> *{Clause}*
 - **method** cl(name, callback) -> *{Clause}*
 - **method** dir(name, value) -> *{Clause}*
 - **method** loc(path, callback) -> *{Clause}*
 - **method** toString() -> *{Clause}*

**class** Location **extends** Clause
A instance is returned when calling `location()` or `loc()` on a Clause.

  - **method** toString() -> *{String}*

**class** NginxConfig **extends** Clause
A instance is returned when calling `nginxc()`

##### Alias

You can use shorthand methods instead, they are.

| Method    |  Alias |
|-----------|:------:|
| directive |  dir   |
| clause    |   cl   |
| location  |  loc   |

### License 

MIT