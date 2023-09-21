// const UserService = require('../services/user.services');

// exports.register = async(req,res,next)=>{
//     try{
//         const {user_email,user_name,user_password} = req.body;

//         const successRes = await UserService.registerUser(user_email,user_name,user_password);

//         res.json({status:true,success:"User register Successfully"});
//     }catch(err){
//         throw(err);
//     }
// }