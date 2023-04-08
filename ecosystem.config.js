module.exports = {
  apps : [
    {
      "ignore_watch" : [
      ],
      "watch_options": {
        "followSymlinks": false,
      },


      script  : "./index.js",
      watch   : true,
      name    : "catalogtracker"
    }

  ]
}