var Koa = require('koa');
var Router = require('koa-router');
const BodyParser = require('koa-bodyparser');


var app = new Koa();
var router = new Router();
var cbdata = [];
const cbdataSize = (process.env.CB_DATA_SIZE || 100);

router
  .get('/cbmonitor', (ctx, next) => {
    let output = cbdata.slice(0, 5);
    ctx.body = JSON.stringify(output, null, 2);
  })
  .get('/cbmonitor/:num', (ctx, next) => {
    let output = cbdata.slice(0, Math.min(ctx.params.num, cbdata.length));
    ctx.body = JSON.stringify(output, null, 2);
  })
  .all('/callback', (ctx, next) => {
    var req = ctx.request;

    let output = {
      timestamp : new Date(),
      method    : req.method,
      body      : req.body,
      url       : req.url,
      origin    : req.origin,
      headers   : req.headers,
      params    : req.query
    };

    /** Remve useless headers */
    delete output.headers['x-site-deployment-id'];
    delete output.headers['was-default-hostname'];
    delete output.headers['x-arr-log-id'];

    // cbdata = JSON.stringify(output, null, 2);
    cbdata = [output].concat(cbdata).slice(0, cbdataSize);
    // cbdata.slice(0, cbdataSize);


    ctx.response.status = 200;
  })
  .all('/(.*)', (ctx, next)=>{
    ctx.body = 'No Function Found'
  });

app
  .use(BodyParser({
    enableTypes:['json', 'form', 'text']
  }))
  .use(router.routes())
  .use(router.allowedMethods());


var port = (process.env.PORT ||  8080 );

app.listen(port);