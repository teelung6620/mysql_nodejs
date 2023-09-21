const express = require("express");
var cors = require("cors");
const app = express();
const mysql = require("mysql2");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const secret = 'Fullstack-Login';

const UserModel = require('./model/user.model')
const multer = require('multer');
const Authlogin = require('./src/controller/login')
const path = require("path")
const fs = require("fs")
const db = require('./src/config/db.config.js')
const initRoute = require('./src/routes/web.js')



app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended : true}))



const connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "nodejs-login"
   });

   connection.connect();







// localhost:4000/
app.get("/",(req, res, next) => {
   
        res.render("index");
     
   
});

// app.get("/query", (req, res, next)=>{
//     connection.query("SELECT * FROM users", (err, results)=> {
//         console.log(results);
//     });
// });


// app.post("/login",(req, res, next)=>{
//     console.log(req.body.email);
//     console.log(req.body.password);
//     connection.execute("SELECT * FROM users WHERE user_email = ? AND user_password = ?",[req.body.email,req.body.password], (err,results)=>{
//         if(err){
//             res.send("false");            
//         }    
//         if(results.length !== 0){
//             res.send("true");
//             res.end();
//         }else{
//             res.send("false");
//             res.end();
//         }
//     });  
// });

//----------------------------------------REGISTER-------------------------------------------------
app.post('/register', jsonParser, (req, res, next) => {
  const checkEmailQuery = 'SELECT * FROM users WHERE user_email = ?';
  connection.query(checkEmailQuery, [req.body.user_email], (err, results) => {
    if (err) {
      console.error(err);
      return res.json({ error: 'error' });
    }

    if (results.length > 0) {
      // พบอีเมลที่ซ้ำกัน
      return res.json({ error: 'Your email is already in use' });
    }
bcrypt.hash(req.body.user_password, saltRounds, function(err, hash) {
  connection.execute(
    'INSERT INTO users ( user_email, user_name, user_password) VALUES (? , ? , ?)',
    [req.body.user_email, req.body.user_name, hash],
    function(err, results, fields) {
      if(err){
       res.json({status: 'error', message: err})
        return
      }
    res.json({status: 'ok'})
   }
  );     
});
});})
//-----------------------------------------------------------------------------------------------
// app.post('/login',jsonParser, Authlogin.login);

app.post('/login', jsonParser, function(req, res, next)  {
  connection.execute(
    'SELECT * FROM users WHERE user_email=?',
    [req.body.user_email],
    function(err, users, fields) {
      if(err){res.json({status: 'error', message: err}); return}
      if(users.length == 0){res.json({status: 'error', message: 'no users found'}); return}
      bcrypt.compare(req.body.user_password, users[0].user_password, function(err, isLogin) {
        if(isLogin){
          var token = jwt.sign({ user_email: users[0].user_email , user_id: users[0].user_id}, secret, { expiresIn: '24h' });
          res.json({status: 'ok', message: 'login success', token})
        
        }else
        {
        
          res.json({status: 'error', message: 'login fail'})
        }
    });
      
   }
  );   
})

app.post('/authen', jsonParser, function(req, res, next)  {
  try{
  const token = req.headers.authorization.split(' ')[1]
  var decoded = jwt.verify(token, secret);
  res.json({status: 'ok', decoded})
  res.json({decoded})
}catch(err){
  res.json({status: 'error', message: err.message})
}
})
app.get('/login', (req, res) => {
    
  const sql = 'SELECT * FROM users';
  
  connection.query(sql, (error, results) => {
    if (error) {
      
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

app.get('/post_data', (req, res) => { 
  const sql = `SELECT *,GROUP_CONCAT(ingredients_list.ingredients_id) AS IDingred 
  ,GROUP_CONCAT(ingredients_list.ingredients_name) AS Ningred 
  ,GROUP_CONCAT(ingredients_list.ingredients_units) AS Uingred
  ,GROUP_CONCAT(ingredients_list.ingredients_cal) AS Cingred
  ,SUM(ingredients_list.ingredients_cal) AS CingredALL
  FROM post_users 
  INNER JOIN users ON post_users.user_id = users.user_id 
  INNER JOIN ingredients_list_in_use ON post_users.post_id = ingredients_list_in_use.post_id 
  LEFT JOIN ingredients_list ON ingredients_list.ingredients_id = ingredients_list_in_use.ingredients_id 
  GROUP BY post_users.post_id`;


    connection.query(sql, (error, results) => {
      if (error) {
        console.log(req.file)
        res.json({status: 'error', message: 'fail'})
        // res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results);
        
      }
      });
      
  });

 
  app.get('/ingredients_data', (req, res) => {
    
    const sql = 'SELECT * FROM ingredients_list';
    
    connection.query(sql, (error, results) => {
      if (error) {
     
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results);
      }
    });
  });



//-------------------------------image----------------------------------------------------//
  // const storage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, './resources/static/assets/upload/'); // โฟลเดอร์ที่จะเก็บรูปภาพ
  //   },
  //   filename: (req, file, cb) => {
  //     cb(null, Date.now() + '-' + file.originalname); // ชื่อไฟล์
  //   },
  // });
  
  // const upload = multer({ storage });
  
  // app.post('/uploadImage', upload.single('upload'), (req, res) => {
  //   // รูปภาพที่อัปโหลดสามารถเข้าถึงผ่าน req.file
  //   // ทำสิ่งที่คุณต้องการกับรูปภาพที่ถูกอัปโหลด
  //   res.send('อัปโหลดรูปภาพสำเร็จ');
  // });

 //-------------------------------userimage----------------------------------------------------//
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './resources/static/assets/upload/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });
  
  app.patch('/uploadImage', upload.single('user_image'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('ไม่พบรูปภาพ');
    }
  
    // บันทึกรูปภาพลงในฐานข้อมูล MySQL
    // const { originalname, path } = req.file;
    // const user_imagename = originalname;
    // const user_image = path;
    console.log(req.file);
    const user_image = req.file.filename;
    
    
    const sql = 'UPDATE users SET user_image = ? WHERE user_id = ?';
    connection.query(sql, [user_image, req.body.user_id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกรูปภาพ');
      }
  
      res.status(200).send('อัปโหลดรูปภาพและบันทึกในฐานข้อมูลสำเร็จ');
      res.json.result;
    });
  });
  //-------------------------------image----------------------------------------------------//

   //-------------------------------PostimageUpdate----------------------------------------------------//
   const PostStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './resources/static/assets/upload_post/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'MENU-' + uniqueSuffix + path.extname(file.originalname))
    },
  });
  
  const Postupload = multer({ 
    storage: PostStorage,
    limits: {fileSize:100000000},
    fileFilter: function(req,file,cb){
      checkFileType(file,cb)
    }
  })


  function checkFileType(file, cb) {
    const fileTypes = /jpeg|png|jpg/
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)

    if(mimetype && extname){
      return cb(null,true)
    }else{
      cb("please upload images only")
    }
  }
  
  
  //app.use(express.static('uploadPostImage'));

 

  // app.patch('/uploadPostImage', Postupload.single('post_image'),(req, res) => {
    
  //     console.log(req.file)
  //   if (!req.file) {
  //     return res.status(400).send('no image');}
    
  
  //   // บันทึกรูปภาพลงในฐานข้อมูล MySQL
  //   // const { originalname, path } = req.file;
  //   // const user_imagename = originalname;
  //   // const user_image = path;
  //   console.log(req.file);
  //   const post_image = req.file.filename;
    
    
  //   const sql = 'UPDATE post_users SET post_image = ? WHERE post_id = ?';
  //   connection.query(sql, [post_image, req.body.post_id], (err, result) => {
  //     if (err) {
  //       console.error(err);
  //       return res.status(500).send('เกิดข้อผิดพลาดในการบันทึกรูปภาพ');
  //     }
  
  //     res.status(200).send('อัปโหลดรูปภาพและบันทึกในฐานข้อมูลสำเร็จ');
  //   });
  
  // });

  
  

  //-------------------------------image----------------------------------------------------//


   //-------------------------------PostDATA----------------------------------------------------//
 
  
   app.post('/post_data', Postupload.single('post_image'), jsonParser, (req, res) => {
    const { post_name, post_description, post_types, user_id, ingredients_id, ingredientsinuse_name } = req.body;
    const post_image = req.file.filename; // รับชื่อไฟล์อัปโหลด

    const sql1 = 'INSERT INTO post_users (post_name, post_description, post_types, user_id, post_image) VALUES (?, ?, ?, ?, ?)';
    const sql2 = 'INSERT INTO ingredients_list_in_use (post_id, ingredients_id, ingredientsinuse_name) VALUES (?, ?, ?)';

    connection.beginTransaction(function (err) {
        if (err) throw err;

        connection.query(sql1, [post_name, post_description, post_types, user_id, post_image], function (err, result) {
            if (err) {
                connection.rollback(function () {
                    throw err;
                });
            }

            const postID = result.insertId;

            connection.query(sql2, [postID, ingredients_id, ingredientsinuse_name], function (err, result) {
                if (err) {
                    connection.rollback(function () {
                        throw err;
                    });
                }

                connection.commit(function (err) {
                    if (err) {
                        connection.rollback(function () {
                            throw err;
                        });
                    }

                    console.log("เพิ่มข้อมูลสำเร็จแล้ว!");
                });
            });
        });
    });
});
  app.use(express.static('post_data'));
  app.use('/uploadPostImage', express.static('./resources/static/assets/upload_post/'));

  app.delete('/DELpost_data/:post_id', jsonParser,(req, res) => {
    const postId = req.params.post_id; 
    const sql = 'DELETE FROM post_users WHERE post_id=?'
    connection.query(sql, [postId],(error, results) => {
      if (error) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results);
      }
    });
  })

////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // app.post('/post_data', jsonParser,(req, res) => {
  //   const { post_name, post_description, post_types} = req.body;
  //   const sql = 'INSERT INTO post_users (post_name, post_description, post_types) VALUES (? , ? , ?)';
  //   connection.query(sql, [post_name, post_description, post_types], (err, result) => {
  //     if (err) {
  //       console.error(err);
  //       res.json({status: 'error', message: err})
  //       // return res.status(500).send('error');
  //     }
  //     res.json({status: 'ok'})  
  //     // res.status(200).send('success');
  //     console.log(req.body);
  //   });
  // });
  // app.use(express.static('post_data'));
  




  // app.get('/verify/:userId', async (req, res) => {
  //   const userId = req.params.userId;
    
  //   const sql = 'UPDATE users SET verified = 1 WHERE id = ?';
  //   db.query(sql, [userId], (err) => {
  //     if (err) {
  //       console.error(err);
  //       res.status(500).json({ message: 'เกิดข้อผิดพลาดในการยืนยันอีเมล' });
  //     } else {
  //       res.json({ message: 'ยืนยันอีเมลสำเร็จ' });
  //     }
  //   });
  // });



app.on('close', () => {
  connection.end();
});
app.listen(4000, () =>{
    console.log("Listening on port 4000");
});