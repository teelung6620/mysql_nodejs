const path = require('path');

const home = (req, res)=> {
    return res.sendFile(path.join(`${__dirname}/C:/KU/Project01/project_mobile/lib/pages/ListPage.dart`))
}
module.exports={
    getHome:home
}