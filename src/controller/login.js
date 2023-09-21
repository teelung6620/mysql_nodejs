exports.login= function(req, res, next)  {
    connection.execute(
      'SELECT * FROM users WHERE user_email=?',
      [req.body.user_email],
      function(err, users, fields) {
        if(err){res.json({status: 'error', message: err}); return}
        if(users.length == 0){res.json({status: 'error', message: 'no users found'}); return}
        bcrypt.compare(req.body.user_password, users[0].user_password, function(err, isLogin) {
          if(isLogin){
            var token = jwt.sign({ user_email: users[0].user_email }, secret, { expiresIn: '10s' });
            res.json({status: 'ok', message: 'login success', token})
          
          }else
          {
          
            res.json({status: 'error', message: 'login fail'})
          }
      });
        
     }
    );   
  }