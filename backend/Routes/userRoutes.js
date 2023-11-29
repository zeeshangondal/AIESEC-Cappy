const {getAllUsers, getUser, login, signup, updateUser , deleteUser, updateAssignEpsCount ,assignEpsToUser, dispatchEmails} = require("../Controller/userController");

const authenticate =require('../Middlewares/authenticate')


const userRouter = require("express").Router();




userRouter.get("/:id" , getUser)

userRouter.post("/signup" , signup)

userRouter.post('/login' , login)

userRouter.patch('/:id' , updateUser)

userRouter.patch('/updateAssignEpsCount/:id' , updateAssignEpsCount)

userRouter.patch('/assignEps/:id' , assignEpsToUser)

userRouter.patch('/email/dispatchEmails' , dispatchEmails)


userRouter.delete('/:id', deleteUser);

userRouter.get('/' , getAllUsers)



module.exports = userRouter;



