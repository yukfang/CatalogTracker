const fs = require('fs');
const getOrderDetail     = require('./utils/athena/detail')
const getOrderTag     = require('./utils/athena/tag')


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
        // let order_id_1 = ctx.headers['order_id']
        let order_id = `${ctx.query.order_id}`

        // order_id = 1023821
        // console.log(ctx.headers)
        const detail = await getOrderDetail(order_id);
        const tag = await getOrderTag(order_id);
        let body = await buildBody(detail, tag);
        // console.log(`resp = ${resp}`)
        // console.log(resp)
        ctx.body = body
        // ctx.body = {
        //     "client" : `Client Name + ${order_id}`,
        //     "owner" : "TSC Owner"
        // }


    } else if (ctx.path === '/') {
         ctx.body = fs.readFileSync('index.html', {encoding:'utf8', flag:'r'});
    } else {
        ctx.body = 'Hello World: ' + ctx.path;
    }

    next();
})

async function buildBody(detail, tag){
    /** Tags map to Status */
    let tags =  tag.map(t=>t.name)
    // console.log(tags)
    let status = ''
    if(detail.status != 3) {
        status = "In-Progress"; // Ticket is still open, we consider this as in-progress
    } else {
        if(tags.includes("Out of Scope")) {
            status = "Out of Scope"
        } else if(tags.includes("Completed - Optimal") || tags.includes("Completed - Not Optimal")) {
            status = "Completed"
        } else {
            status = "Client Dropoff"
        }
    }

    /** Client Name */
    const client = detail.items.filter(r=> r.label.includes('Client Name') || r.label.includes('Advertiser name')).pop().content;

    /** Country */
    const regionLables = [
        'Region', 'Country / Region', 'Client Region', 'Country/Region', 'GBS Country/Region', "GBS Country / Region"
    ]
    const country = detail.items.filter(r => regionLables.includes(r.label)).pop().content;

    /** Current Follower */
    const follower = detail.follower;

    /** Service Type */
    const category_1_name =  detail.category_1_name;
    console.log(`category name : ${category_1_name}`)
    let srv_type = '';
    if (detail.items.filter(r => r.label == "categorization").pop().content.category_1_name.toLowerCase().includes("catalog")) {
        srv_type = "Inbound"
    } else if (detail.items.filter(r => r.label == "categorization").pop().content.category_1_name.toLowerCase().includes("new request")) {
        srv_type = "Audit"
    } else {
        if(category_1_name.toLowerCase().includes("catalog")) {
            srv_type = "Inbound"
        } else if (category_1_name.toLowerCase().includes("new request")) {
            srv_type = "Audit"
        } else {
            srv_type = "UNKNOWN!!!"
        }
    }

    /** Ticket Open Time */
    const create_time = (new Date(detail.create_time*1000)).toISOString().split('T')[0];

    // const title = data.title,
    // items: data.items,
    const replies=  detail.replies;
    // const replies_items = detail.replies[0].items

    /** Blocker */
    let   blocker = '';
    let   feedback = '';
    let   dropoff = '';

    if(replies) {
        const blocker_reg    = /(\[blocker\]\[)(.*)(\])/m
        const feedback_reg   = /(\[feedback\]\[)(.*)(\])/m
        const dropoff_reg    = /(\[dropoff\]\[)(.*)(\])/m

        for(let k = 0; k < replies.length; k++) {
            const reply = replies[k];
            const reply_time = (new Date(reply.create_time*1000)).toISOString().split('T')[0];
            const items = reply.items.filter(x => x.type == 6);

            for(let j = 0; j < items.length; j++) {
                const item = items[j];

                /** Product feedback */
                let feedback_matches = item.content.match(feedback_reg);
                if(feedback_matches) {
                    feedback = feedback_matches[2]
                }

                /** Client drop off reason */
                let dropoff_matches = item.content.match(dropoff_reg);
                if(dropoff_matches) {
                    dropoff = dropoff_matches[2]
                }

                /** Blockers */
                let blocker_matches = item.content.match(blocker_reg);
                if(blocker_matches) {
                    const notes = blocker_matches[2];
                    let issues = {
                        signal: false,
                        catalog: false,
                        other: false,
                    }
                    if(notes.toLowerCase().includes('signal')) {
                        issues.signal = true;
                    }
                    if(notes.toLowerCase().includes('pixel')) {
                        issues.signal = true;
                    }
                    if(notes.toLowerCase().includes('catalog')) {
                        issues.catalog = true;
                    }
                    if(notes.toLowerCase().includes('other')) {
                        issues.other = true;
                    }

                    if(issues.signal == true && issues.catalog == true) {
                        blocker = 'Signal+Catalog'
                    } else if (issues.signal == true) {
                        blocker = 'Signal Only'
                    } else if (issues.catalog == true) {
                        blocker = 'Catalog Only'
                    } else if (issues.other == true) {
                        blocker = 'Other Issue'
                    } else {
                        blocker = "No Major Issue"
                    }
                    console.log(`blocker = ${blocker}`)
                }
            }
        }
    } else {
        console.log('no match')
    }

    return JSON.stringify({
        refresh: (new Date(Date.now())).toISOString().substring(0,19) + 'Z',
        client,
        status,
        country,
        follower,
        create_time,
        srv_type,
        blocker,
        dropoff,
        feedback,


        delimeter: "------------------------------------------------",
        replies,


        detail
    }, null, 2)
}

async function init() {
    console.log(`Server Init ---> ${(new Date(Date.now())).toISOString()}`);
}

module.exports = {
  koaApp,
  init,
};


