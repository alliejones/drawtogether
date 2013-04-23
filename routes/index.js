
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', {
    title: 'nodechat!',
    appPort: req.app.settings.port || ''
  });
};