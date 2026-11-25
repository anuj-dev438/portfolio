const express=require('express');

const router=express.Router()
const multer=require('multer')
const path=require('path')
const fs = require('fs')
const Student=require('../models/students.model')

const storage=multer.diskStorage({
    destination:(req,file,cb) =>{
  cb(null,'uploads/')
    },
    filename:(req,file,cb) =>{
        const newFileName =Date.now() +path.extname(file.originalname)
        cb(null,newFileName  )
    }
})
 
const fileFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image/')){
        cb(null,true)
    }else{
        cb(new Error('Only image are allowed'),false)
    }

}
const upload=multer({
    storage: storage,
    fileFilter:fileFilter ,
    limits:{
      fileSize: 3024*1024*3 
    }
})
//Get All Student
router.get('/',async(req,res)=>{
    try{

const search = req.query.search || ''

const query={
    $or:[
        {first_name: {$regex:search, $options: 'i'}},
        {last_name:  {$regex:search, $options: 'i'}}
    ]
}


const students= await Student.find(query)
res.json(students)

    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})



//Get ba single student
router.get('/:id',async(req,res)=>{
    try{
const student= await Student.findById(req.params.id)
if(!student) return res.status(500).json({
            message: "Student not found"
        })
res.json(student)

    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

//Add new  Student
router.post('/' ,upload.single('profile_pic'),async(req,res)=>{
    console.log("Incoming Data:", req.body)
      console.log("File:", req.file);
    try{
//  const newStudent=await Student.create(req.body)

const student=new Student(req.body)
if(req.file){
    student.profile_pic=req.file.filename
}
const newStudent=await student.save()

res.status(200).json(newStudent)
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

//Update a Student
router.put('/:id',upload.single('profile_pic'),async(req,res)=>{
    try{

const existingStudent=await Student.findById(req.params.id)
 if(!existingStudent) {
    
     if(req.file){
 const filePath=path.join('./uploads',req.file,filename)
    fs.unlink(filePath,(err)=>{
if(err) console.log('Failed to Delete image:',err)
    })
     }
    {return res.status(500).json({
            message: "Student not found"                            
        }) 

    }}
        if(req.file){
            if(existingStudent.profile_pic){
                   const oldimagePath=path.join('./uploads',existingStudent.profile_pic)
    fs.unlink(oldimagePath,(err)=>{
if(err) console.log('Failed to Delete old image:',err)
    })
            }

req.body.profile_pic=req.file.filename

        }

const updateStudent=await Student.findByIdAndUpdate(req.params.id,req.body,
    {new: true}
)
  
        res.json( updateStudent)
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

//Delete All Student
router.delete('/:id',async(req,res)=>{
    try{

const student = await Student.findByIdAndDelete(req.params.id)
if(!student) return res.status(404).json({
            message: "Student not found"
        })  
if(student.profile_pic){
    const filePath=path.join('./uploads',student.profile_pic)
    fs.unlink(filePath,(err)=>{
if(err) console.log('Failed to Delete:',err)
    })
}

res.json({message:'Student Deleted'})
    }catch(err){
        res.status(500).json({
            message: err.message
        })
    }
})

module.exports= router
