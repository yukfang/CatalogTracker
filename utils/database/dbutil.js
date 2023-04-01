const { Sequelize, Model, DataTypes } = require('sequelize');
require('dotenv').config();

const DB_NAME       = process.env.DB_NAME
const DB_USER       = process.env.DB_USER
const DB_PASSWORD   = process.env.DB_PASSWORD
const DB_HOST       = process.env.DB_HOST


const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'mysql', /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
  logging: false,
  dialectOptions: {
    // Your mysql2 options here
  }
});



class AdInfo extends Model {}
class AdPerf extends Model {}

AdPerf.init({
  ad_id:                  { type: DataTypes.STRING, allowNull: false},
  stat_time_day:          { type: DataTypes.STRING, allowNull: false},
  spend:                  { type: DataTypes.STRING, allowNull: false},
  impressions:            { type: DataTypes.STRING, allowNull: false},
  clicks:                 { type: DataTypes.STRING, allowNull: false},
  conversion:             { type: DataTypes.STRING, allowNull: false},
  onsite_shopping:        { type: DataTypes.STRING, allowNull: false},
  onsite_shopping_roas :  { type: DataTypes.STRING, allowNull: false},
  campaign_name:          { type: DataTypes.STRING, allowNull: false},
  advertiser_id:          { type: DataTypes.STRING, allowNull: false},
  campaign_id:            { type: DataTypes.STRING, allowNull: false},
  adgroup_id:             { type: DataTypes.STRING, allowNull: false},
},{
  sequelize,
  modelName: 'AdPerf'
})

AdInfo.init({
  // Model attributes are defined here
  advertiser_id:    { type: DataTypes.STRING, allowNull: false},
  campaign_id:      { type: DataTypes.STRING, allowNull: false},
  ad_id:            { type: DataTypes.STRING, allowNull: false},
  item_group_id:    { type: DataTypes.STRING, allowNull: false},
  item_group_ids:   { type: DataTypes.STRING, allowNull: false}

}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'AdInfo' // We need to choose the model name
});


async function initDb() {
    await AdInfo.sync({ force: false });
    await AdPerf.sync({ force: false });

    return {AdInfo, AdPerf}
}

module.exports = initDb