
const fs = require('fs')
const spuNameMapping = require('../spu/spu')

const initDb = require('../database/dbutil')
const { Op } = require("sequelize");


var fetchTime = 0;
var spuPerfCache = null;

async function getSpuPerf() {
    if(Date.now() - fetchTime < 1000  * 1800 ) {
        return spuPerfCache
    }

    const {AdInfo, AdPerf} = await initDb();

    let adSet  = (await AdInfo.findAll()).map(e=>e.dataValues);
    let adPerf = (await AdPerf.findAll()).map(e=>e.dataValues);

    console.log(`adSet ${adSet.length}`);
    console.log(`adperf ${adPerf.length}`);

    for(let i = 0; i < adPerf.length; i++) {
        // console.log('' + i  + " " + adPerf[i].ad_id)
        const adId = adPerf[i].ad_id;
        // console.log(adId);

        const spuId = adSet.find(s => s.ad_id == adId).item_group_id
        // console.log(spuID)

        adPerf[i].spuId = spuId
    }

    // adPerf = adPerf.filter(x => x.spuId == '1729541624426825852' )

    // adPerf = adPerf.filter(x => x.spuId == '1729517643331438716' )
    // adPerf = adPerf.filter(x => x.spuId == '1729549311797594236' )
    // adPerf = adPerf.filter(x => x.spuId == '1729549311797594236' )

    console.table(adPerf)

    for(let i = 0; i < adPerf.length; i++) {
        adPerf[i].totalValue = parseFloat(adPerf[i].spend) * parseFloat(adPerf[i].onsite_shopping_roas)
    }

    /** Get Unique SPU IDs */
    var spuIds = {}
    for(let i = 0; i < adPerf.length; i++) {
        const spuId = adPerf[i].spuId;
        spuIds[spuId] = 1;
    }

    var spuIds = Object.keys(spuIds);

    /** Calc SPU Perf */
    let spuPerfs = [];
    for(let i = 0; i < spuIds.length; i++) {
        const spuId = spuIds[i];
        const spuName = spuNameMapping[spuId] || 'N/A';
        const perf = adPerf.filter(adp => adp.spuId == spuId);
        // console.log(`perf.length = ` + perf.length)



        console.table(perf, [
            "stat_time_day", "campaign_id", "campaign_name","ad_id", "spend", "conversion" , "onsite_shopping_roas", "totalValue"
        ])

        var spend = 0;
        var impressions = 0;
        var clicks = 0;
        var onsite_shopping = 0;
        // var onsite_shopping_roas = 0;
        var conversion = 0;
        var totalValue = 0;
        for(let p = 0; p < perf.length; p++) {
            spend += parseFloat(perf[p].spend);
            impressions += parseInt(perf[p].impressions)
            clicks += parseInt(perf[p].clicks)
            conversion += parseInt(perf[p].conversion)
            totalValue += parseFloat(perf[p].spend) * parseFloat(perf[p].onsite_shopping_roas)
            // console.log(`onsite_shopping_roas ${onsite_shopping_roas} onsite shopping ${onsite_shopping}`)
            // break;
        }
        // break;

        let spuPerf = {
            spuId,
            spuName,
            spend: spend.toFixed(2),
            impressions,
            clicks,

            conversion,
            totalValue: totalValue.toFixed(2),
            cpa_ : ((conversion==0)?0:(spend/conversion)).toFixed(2),
            roas: ((spend==0)?0:(totalValue / spend)).toFixed(2)
        }

        spuPerfs.push(spuPerf);
    }

    console.table(spuPerfs);

    fetchTime = Date.now();
    spuPerfCache = spuPerfs

    return spuPerfCache;
}

// toy();

module.exports = getSpuPerf