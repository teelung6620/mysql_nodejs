const express = require("express");
const app = express();
const mysql = require("mysql2");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/query", (req, res, next)=>{
    connection.query("SELECT * FROM users", (err, results)=> {
        console.log(results);
    });
});


app.post("/login",(req, res, next)=>{
    console.log(req.body.email);
    console.log(req.body.password);
    connection.execute("SELECT * FROM users WHERE email = ? AND password = ?",[req.body.email,req.body.password], (err,results)=>{
        if(err){
            res.send("false");            
        }    
        if(results.length !== 0){
            res.send("true");
            res.end();
        }else{
            res.send("false");
            res.end();
        }
    });  
});

app.post('/register', (req, res) => {
    const { name, email,  password } = req.body;
    
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    connection.query(sql, [name, email, password], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
      } else {
        res.json({ message: 'ลงทะเบียนเรียบร้อยแล้ว' });
      }
    });
  });

app.get('/data', (req, res) => {
    
    const sql = 'SELECT * FROM post_users';
    
    connection.query(sql, (error, results) => {
      if (error) {
     
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(results);
      }
    });
  });

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