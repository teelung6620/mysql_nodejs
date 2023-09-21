const multer = require('multer');

const imageFilter = (req,file,cb)=>{
    if(file.mimetpe.startWith("image")){
        cb(null, true);
    }else{
        cb("please upload only image", false);
    }
}

let storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null,__basedir + "/resources/static/assets/uploads/");
    }
})

let uploadFile = multer({ storage: storage, fileFilter: imageFilter});

module.exports = uploadFile;