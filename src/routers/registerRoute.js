// const express = require("express");
// const router = express.Router();
// var jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const secret = "Fullstack-Login";
// const connection = require("../config/db.config");
// const multer = require("multer");
// var jwt = require("jsonwebtoken");
// const path = require("path");

// router.use(express.json());
// router.use(express.urlencoded({ extended: true }));

// const PostStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "../../resources/static/assets/upload_post");
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, "MENU-" + uniqueSuffix + path.extname(file.originalname));
//     },
// });

// const Postupload = multer({
//     storage: PostStorage,
//     limits: { fileSize: 100000000 },
//     fileFilter: function (req, file, cb) {
//         checkFileType(file, cb);
//     },
// });

// function checkFileType(file, cb) {
//     const fileTypes = /jpeg|png|jpg/;
//     const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     //const mimetype = fileTypes.test(file.mimetype);

//     if (extname) {
//         return cb(null, true);
//     } else {
//         console.log(file);
//         console.log(extname);
//         console.log(mimetype);
//         cb("please upload images only");
//     }
// }

// router.post("/", Postupload.single("user_image"), (req, res, next) => {
//     // ตรวจสอบไฟล์
//     if (!req.file) {
//         console.error("No file uploaded");
//         return res.json({ error: "No file uploaded" });
//     }

//     const user_image = req.file.filename;
//     const checkEmailQuery = "SELECT * FROM users WHERE user_email = ?";
//     connection.query(checkEmailQuery, [req.body.user_email], (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.json({ error: "error" });
//         }

//         if (results.length > 0) {
//             // พบอีเมลที่ซ้ำกัน
//             return res.json({ error: "Your email is already in use" });
//         }
//         bcrypt.hash(req.body.user_password, saltRounds, function (err, hash) {
//             // แนบคอลัมน์ user_type ด้วยค่าเริ่มต้น "user"
//             connection.execute(
//                 "INSERT INTO users (user_email, user_name, user_password, user_image, user_type) VALUES (?, ?, ?, ?, ?)",
//                 [req.body.user_email, req.body.user_name, hash, user_image, "user"],
//                 function (err, results, fields) {
//                     if (err) {
//                         res.json({ status: "error", message: err });
//                         return;
//                     }
//                     res.json({ status: "ok" });
//                 }
//             );
//         });
//     });
// });
