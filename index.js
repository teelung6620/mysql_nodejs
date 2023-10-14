const express = require("express");
var cors = require("cors");
const app = express();
const connection = require("./src/config/db.config");

const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const secret = "Fullstack-Login";

const multer = require("multer");

const path = require("path");

const loginRoute = require("./src/routers/loginRoute");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/login", loginRoute);

// localhost:4000/
app.get("/", (req, res, next) => {
    res.render("index");
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./resources/static/assets/upload/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

const PostStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./resources/static/assets/upload_post/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "MENU-" + uniqueSuffix + path.extname(file.originalname));
    },
});

const Postupload = multer({
    storage: PostStorage,
    limits: { fileSize: 100000000 },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

function checkFileType(file, cb) {
    const fileTypes = /jpeg|png|jpg/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    //const mimetype = fileTypes.test(file.mimetype);

    if (extname) {
        return cb(null, true);
    } else {
        console.log(file);
        console.log(extname);
        console.log(mimetype);
        cb("please upload images only");
    }
}

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
app.post("/register", Postupload.single("user_image"), (req, res, next) => {
    // ตรวจสอบว่ามีไฟล์ถูกอัปโหลดหรือไม่
    if (!req.file) {
        console.error("No file uploaded");
        return res.json({ error: "No file uploaded" });
    }

    const user_image = req.file.filename;
    const checkEmailQuery = "SELECT * FROM users WHERE user_email = ?";
    connection.query(checkEmailQuery, [req.body.user_email], (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ error: "error" });
        }

        if (results.length > 0) {
            // พบอีเมลที่ซ้ำกัน
            return res.json({ error: "Your email is already in use" });
        }
        bcrypt.hash(req.body.user_password, saltRounds, function (err, hash) {
            // แนบคอลัมน์ user_type ด้วยค่าเริ่มต้น "user"
            connection.execute(
                "INSERT INTO users (user_email, user_name, user_password, user_image, user_type) VALUES (?, ?, ?, ?, ?)",
                [req.body.user_email, req.body.user_name, hash, user_image, "user"],
                function (err, results, fields) {
                    if (err) {
                        res.json({ status: "error", message: err });
                        return;
                    }
                    res.json({ status: "ok" });
                }
            );
        });
    });
});

//-----------------------------------------------------------------------------------------------
// app.post('/login',jsonParser, Authlogin.login);

app.post("/authen", function (req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        var decoded = jwt.verify(token, secret);
        res.json({ status: "ok", decoded });
        res.json({ decoded });
    } catch (err) {
        res.json({ status: "error", message: err.message });
    }
});

// app.get("/post_data", (req, res) => {
//     //     const sql = `SELECT *
//     //   FROM post_users
//     //   INNER JOIN users ON post_users.user_id = users.user_id
//     //   INNER JOIN ingredients_list_in_use ON post_users.post_id = ingredients_list_in_use.post_id
//     //   LEFT JOIN ingredients_list ON ingredients_list.ingredients_id = ingredients_list_in_use.ingredients_id
//     //   GROUP BY post_users.post_id`;

//     const sql = `
//     SELECT post_users.*, users.user_id AS user_id, users.user_name AS user_name
//         FROM post_users
//         INNER JOIN users ON post_users.user_id = users.user_id
//     `;

//     // `WHERE ingredients_id = 1 OR ingredients_id = 2 OR ingredients_id = 3`
//     // `WHERE ingredients_id IN (1,2,3)`

//     connection.query(sql, (error, results) => {
//         if (error) {
//             console.log(req.file);

//             res.json({ status: "error", message: "fail" });
//             // res.status(500).json({ error: 'Internal Server Error' });
//         } else {
//             for (let i = 0; i < results.length; i++) {
//                 const ingredients = JSON.parse(results[i].ingredients_id);
//                 const sql2 = connection.format(
//                     `
//                     SELECT ingredients_name, ingredients_units, ingredients_cal, ingredients_unitsName FROM ingredients_list WHERE ingredients_id IN (?);
//                 `,
//                     [ingredients.id]
//                 );
//                 connection.query(sql2, (error2, results2) => {
//                     if (error2) {
//                         console.log(req.file);
//                         res.json({ status: "error", message: "fail" });
//                         // res.status(500).json({ error: 'Internal Server Error' });
//                     } else {
//                         results[i].ingredients_id = [];
//                         const result2Size = results2.length;
//                         results2.forEach((item, index) => {
//                             const thisCal = (ingredients.unit[index] / item.ingredients_units) * item.ingredients_cal;
//                             item.ingredients_units = ingredients.unit[index];
//                             item.ingredients_cal = thisCal;
//                             // console.log(item);
//                             results[i].ingredients_id.push(item);
//                             if (i === results.length - 1 && index === result2Size - 1) {
//                                 res.json(results);
//                                 res.end();
//                             }
//                         });
//                     }
//                 });
//             }
//         }
//     });
// });
app.get("/post_data", (req, res) => {
    const sql = `
        SELECT 
            post_users.*,
            users.user_id AS user_id,
            users.user_name AS user_name,
            IFNULL(ROUND(AVG(scores.score_num), 1), 0) AS average_score,
            COUNT(scores.score_num) AS num_of_scores
        FROM post_users
        INNER JOIN users ON post_users.user_id = users.user_id
        LEFT JOIN scores ON post_users.post_id = scores.post_id
        GROUP BY post_users.post_id
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            console.log(req.file);
            res.json({ status: "error", message: "fail" });
        } else {
            const postDetails = [];

            // วนลูปผลลัพธ์เพื่อคำนวณ totalcal แยกตามแต่ละ post_id
            results.forEach((result, i) => {
                const ingredients = JSON.parse(result.ingredients_id);
                let totalCal = 0; // สร้างตัวแปรเพื่อเก็บผลรวม "ingredients_cal"

                const sql2 = connection.format(
                    `
                    SELECT ingredients_name, ingredients_units, ingredients_cal, ingredients_unitsName FROM ingredients_list WHERE ingredients_id IN (?);
                `,
                    [ingredients.id]
                );

                connection.query(sql2, (error2, results2) => {
                    if (error2) {
                        console.log(req.file);
                        res.json({ status: "error", message: "fail" });
                    } else {
                        results[i].ingredients_id = [];
                        const result2Size = results2.length;

                        results2.forEach((item, index) => {
                            const thisCal = (ingredients.unit[index] / item.ingredients_units) * item.ingredients_cal;
                            item.ingredients_units = ingredients.unit[index];
                            item.ingredients_cal = thisCal;
                            totalCal += thisCal; // เพิ่ม "ingredients_cal" ในผลรวม

                            results[i].ingredients_id.push(item);

                            if (index === result2Size - 1) {
                                results[i].totalCal = totalCal; // เพิ่มผลรวม "ingredients_cal" ในข้อมูลของแต่ละ post_id
                                results[i].average_score = result.average_score; // เพิ่มค่าเฉลี่ย
                                results[i].num_of_scores = result.num_of_scores; // เพิ่มจำนวน score_num
                                postDetails.push(results[i]); // เพิ่มข้อมูล postDetails ในอาร์เรย์

                                if (i === results.length - 1) {
                                    res.json(postDetails);
                                    res.end();
                                }
                            }
                        });
                    }
                });
            });
        }
    });
});

app.get("/ingredients_data", (req, res) => {
    const sql = "SELECT * FROM ingredients_list";

    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(results);
        }
    });
});

app.post("/ingredients_data", (req, res) => {
    const { ingredients_name, ingredients_units, ingredients_unitsName, ingredients_cal } = req.body;

    // 1. ตรวจสอบว่าชื่อซ้ำหรือไม่โดยใช้ SQL query
    const checkDuplicateQuery = "SELECT * FROM ingredients_list WHERE ingredients_name = ?";
    connection.query(checkDuplicateQuery, [ingredients_name], (err, results) => {
        if (err) {
            console.error("Error checking for duplicate:", err);
            return res.status(500).json({ error: "Failed to check for duplicate ingredient" });
        }

        if (results.length > 0) {
            // 2. ถ้ามีข้อมูลในผลลัพธ์ แสดงว่าชื่อซ้ำ
            return res.status(400).json({ error: "ชื่อส่วนผสมนี้มีอยู่แล้ว" });
        }

        // 3. ถ้าชื่อไม่ซ้ำ ก็สร้างคำสั่ง SQL INSERT และเพิ่มข้อมูล
        const insertQuery =
            "INSERT INTO ingredients_list (ingredients_name, ingredients_units, ingredients_unitsName, ingredients_cal) VALUES (?, ?, ?, ?)";

        connection.query(insertQuery, [ingredients_name, ingredients_units, ingredients_unitsName, ingredients_cal], (err, result) => {
            if (err) {
                console.error("Error adding ingredient:", err);
                return res.status(500).json({ error: "Failed to add ingredient" });
            }
            console.log("Ingredient added:", result);
            return res.json({ status: "ok" });
        });
    });
});

app.get("/bookmarks", (req, res) => {
    const sql = "SELECT * FROM bookmarks";

    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(results);
        }
    });
});

app.post("/bookmarks", (req, res) => {
    const { user_id, post_id } = req.body;
    const sqlSelect = "SELECT * FROM bookmarks WHERE user_id = ? AND post_id = ?";
    const sqlInsert = "INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)";

    // ทำการค้นหาบันทึกที่มี user_id และ post_id เหมือนกัน
    connection.query(sqlSelect, [user_id, post_id], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            if (results.length > 0) {
                // หากมีบันทึกที่ซ้ำกันแล้ว ส่งข้อความผิดพลาด
                res.status(400).json({ error: "Bookmark already exists" });
            } else {
                // หากไม่มีบันทึกที่ซ้ำกัน ทำการเพิ่มบันทึกใหม่
                connection.query(sqlInsert, [user_id, post_id], (error, insertResults) => {
                    if (error) {
                        res.status(500).json({ error: "Internal Server Error" });
                    } else {
                        res.status(200).json({ message: "Bookmark added successfully" });
                    }
                });
            }
        }
    });
});

app.delete("/DELbookmarks/:bookmark_id", (req, res) => {
    const bookmarkId = req.params.bookmark_id;

    const sql = "DELETE FROM bookmarks WHERE bookmark_id=? ";

    connection.query(sql, [bookmarkId], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // ถ้ามีการลบรายการใด ๆ ในฐานข้อมูล
            res.status(200).json({ message: "ok" });
            //res.json({ status: "ok" });
        }
    });
});

app.get("/scores", (req, res) => {
    const sql = "SELECT * FROM scores";

    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(results);
        }
    });
});

app.post("/scores", (req, res) => {
    const { user_id, post_id, score_num } = req.body;
    const sqlSelect = "SELECT * FROM scores WHERE user_id = ? AND post_id = ?";
    const sqlInsert = "INSERT INTO scores (user_id, post_id, score_num) VALUES (?, ?, ?)";

    // ทำการค้นหาบันทึกที่มี user_id และ post_id เหมือนกัน
    connection.query(sqlSelect, [user_id, post_id], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            if (results.length > 0) {
                // หากมีบันทึกที่ซ้ำกันแล้ว ส่งข้อความผิดพลาด
                res.status(400).json({ error: "scores already exists" });
            } else {
                // ตรวจสอบว่าคะแนนที่ส่งมาอยู่ในช่วง 1-5
                if (score_num >= 1 && score_num <= 5) {
                    // หากไม่มีบันทึกที่ซ้ำกัน และคะแนนถูกต้อง ทำการเพิ่มบันทึกใหม่
                    connection.query(sqlInsert, [user_id, post_id, score_num], (error, insertResults) => {
                        if (error) {
                            res.status(500).json({ error: "Internal Server Error" });
                        } else {
                            res.status(200).json({ message: "scores added successfully" });
                        }
                    });
                } else {
                    res.status(400).json({ error: "Invalid score number. It should be between 1 and 5." });
                }
            }
        }
    });
});

app.delete("/DELscores/:scores_id", (req, res) => {
    const scoresId = req.params.bookmark_id;

    const sql = "DELETE FROM scores WHERE scores_id=? ";

    connection.query(sql, [scoresId], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // ถ้ามีการลบรายการใด ๆ ในฐานข้อมูล
            res.status(200).json({ message: "ok" });
            //res.json({ status: "ok" });
        }
    });
});

app.get("/comments", (req, res) => {
    const sql = `SELECT comments.*, users.user_id AS user_id, users.user_name AS user_name, users.user_image AS user_image
        FROM comments
        INNER JOIN users ON comments.user_id = users.user_id;`;

    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(results);
        }
    });
});

app.post("/comments", (req, res) => {
    const { post_id, user_id, comment_line } = req.body;

    const sql1 = "INSERT INTO comments (post_id, user_id ,comment_line) VALUES (?, ?, ?)";

    connection.query(sql1, [post_id, user_id, comment_line], function (err, result) {
        if (err) {
            connection.rollback(function () {
                throw err;
            });
        }
        res.status(200);
        res.json(req.body);
        //res.json({ status: "ok" });
    });
});
app.use(express.static("comments"));

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

app.patch("/uploadImage", upload.single("user_image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("ไม่พบรูปภาพ");
    }

    // บันทึกรูปภาพลงในฐานข้อมูล MySQL
    // const { originalname, path } = req.file;
    // const user_imagename = originalname;
    // const user_image = path;
    console.log(req.file);
    const user_image = req.file.filename;

    const sql = "UPDATE users SET user_image = ? WHERE user_id = ?";
    connection.query(sql, [user_image, req.body.user_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
        }

        res.status(200).send("อัปโหลดรูปภาพและบันทึกในฐานข้อมูลสำเร็จ");
        res.json.result;
    });
});
//-------------------------------image----------------------------------------------------//

//-------------------------------PostimageUpdate----------------------------------------------------//

//app.use(express.static('uploadPostImage'));

app.patch("/uploadPostImage", Postupload.single("post_image"), (req, res) => {
    console.log(req.file);
    if (!req.file) {
        return res.status(400).send("no image");
    }

    // บันทึกรูปภาพลงในฐานข้อมูล MySQL
    // const { originalname, path } = req.file;
    // const user_imagename = originalname;
    // const user_image = path;
    console.log(req.file);
    const post_image = req.file.filename;

    const sql = "UPDATE post_users SET post_image = ? WHERE post_id = ?";
    connection.query(sql, [post_image, req.body.post_id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("เกิดข้อผิดพลาดในการบันทึกรูปภาพ");
        }

        res.status(200).send("อัปโหลดรูปภาพและบันทึกในฐานข้อมูลสำเร็จ");
    });
});

//-------------------------------image----------------------------------------------------//

//-------------------------------PostDATA----------------------------------------------------//

app.post("/post_data", Postupload.single("post_image"), (req, res) => {
    // console.log(req.body);
    const { post_name, post_description, post_types, user_id } = req.body;
    const ingredients_unit = JSON.parse(req.body.ingredients_unit);
    const ingredients_id = req.body.ingredients_id.split(",");
    const post_image = req.file.filename; // รับชื่อไฟล์อัปโหลด

    res.status(200);
    //res.end();

    const sql1 = "INSERT INTO post_users (post_name, post_description, post_types, ingredients_id, user_id, post_image) VALUES (?, ?, ?, ?, ?, ?)";
    // // const sql2 = "INSERT INTO ingredients_list_in_use (post_id, ingredients_id) VALUES (?, ?)";

    const ingredientsData = { id: [], unit: [] };

    ingredients_id.forEach((item, index) => {
        ingredientsData.id.push(parseInt(item));
        ingredientsData.unit.push(ingredients_unit[index]);
    });

    // // connection.beginTransaction(function (err) {
    // //     if (err) throw err;

    try {
        connection.query(
            sql1,
            [post_name, post_description, post_types, JSON.stringify(ingredientsData), user_id, post_image],
            function (err, result1) {
                if (err) {
                    connection.rollback(function () {
                        throw err;
                    });
                }
                //res.status(200);
                res.json({ status: "ok" });
            }
        );
    } catch (error) {}
});

// });
app.use(express.static("post_data"));
app.use("/uploadPostImage", express.static("./resources/static/assets/upload_post/"));

app.delete("/DELpost_data/:post_id", (req, res) => {
    const postId = req.params.post_id;
    const sql = "DELETE FROM post_users WHERE post_id=?";
    connection.query(sql, [postId], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            // ถ้ามีการลบรายการใด ๆ ในฐานข้อมูล
            res.status(200).json({ message: "ok" });
            //res.json({ status: "ok" });
        }
        // if (error) {
        //     res.status(500).json({ error: "Internal Server Error" });
        // } else {
        //     res.json(results);
        // }
    });
});

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

app.on("close", () => {
    connection.end();
});
app.listen(4000, () => {
    console.log("Listening on port 4000");
});
