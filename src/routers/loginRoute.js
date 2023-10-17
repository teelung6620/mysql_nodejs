const express = require("express");
const router = express.Router();
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const secret = "Fullstack-Login";
const connection = require("../config/db.config");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/", function (req, res, next) {
    connection.execute("SELECT * FROM users WHERE user_email=?", [req.body.user_email], function (err, users, fields) {
        if (err) {
            res.json({ status: "error", message: err });
            return;
        }
        if (users.length == 0) {
            res.json({ status: "error", message: "no users found" });
            return;
        }
        bcrypt.compare(req.body.user_password, users[0].user_password, function (err, isLogin) {
            if (isLogin) {
                // ตรวจสอบสถานะของผู้ใช้ (user หรือ admin)
                if (users[0].user_type === "user") {
                    var token = jwt.sign(
                        {
                            user_email: users[0].user_email,
                            user_id: users[0].user_id,
                            user_name: users[0].user_name,
                            user_image: users[0].user_image,
                            user_type: users[0].user_type,
                            banned: users[0].banned,
                        },
                        secret,
                        {
                            expiresIn: "24h",
                        }
                    );
                    res.json({ status: "ok_user", message: "user login success", token });
                } else if (users[0].user_type === "admin") {
                    // สามารถเปลี่ยน message และการตอบกลับอื่น ๆ สำหรับ admin
                    var token = jwt.sign(
                        {
                            user_email: users[0].user_email,
                            user_id: users[0].user_id,
                            user_name: users[0].user_name,
                            user_image: users[0].user_image,
                            user_type: users[0].user_type,
                            banned: users[0].banned,
                        },
                        secret,
                        {
                            expiresIn: "48h",
                        }
                    );
                    res.json({ status: "ok_admin", message: "admin login success", token });
                }
            } else {
                res.json({ status: "error", message: "login fail" });
            }
        });
    });
});

router.get("/", (req, res) => {
    const sql = "SELECT * FROM users";

    connection.query(sql, [req.body.user_id], (error, results) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        } else {
            res.json(results);
        }
    });
});

module.exports = router;
