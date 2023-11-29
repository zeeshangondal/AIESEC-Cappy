const multer=require("multer")
const path=require("path")


const upload=multer({
    storage:multer.diskStorage({
        destination:function(req,file,cb){
            cb(null,"public/uploads")
        },
        filename:function(req,file,cb){
            let filePath=Date.now() +"-"+file.originalname
            console.log("FILE PATH: "+filePath)
            cb(null,filePath)
            if(!req.body.file){
                req.body.file=[]
            }
            req.body.file.push(filePath)

        }
    })
}).array("file",130)

module.exports=upload