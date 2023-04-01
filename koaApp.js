const fs = require('fs');
const getSpuPerf     = require('./utils/spu/getSpuPerf')

const Koa = require('koa');
const koaApp = new Koa();
var port = (process.env.PORT ||  80 );


koaApp.use(async (ctx, next) => {
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
    await next();
});


// x-response-time
koaApp.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});


koaApp.use(async (ctx, next) => {
    if (ctx.path === '/data') {
        ctx.body = await getSpuPerf();
    } else if (ctx.path === '/') {
         ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
    } else {
        ctx.body = 'Hello World: ' + ctx.path;
    }

    next();
})


async function init() {
    console.log("init here ....");
}

module.exports = {
  koaApp,
  init,
};


