const express = require('express');
require('../config/dev.env')
require('./db/mongoose');
const User = require('./models/user');
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();
const port = process.env.PORT;

// app.use((req,res,next) => {
//     if(req.method) {
//         res.status(503).send('Site in maintenance mode')
//     } else {
//         console.log(req.method, req.path);
//         next();
//     }
// })

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port ,() => {
    console.log('server is running on port '+port);
})

// const main = async () => {
    // const task = await Task.findById('5e1ad18f08c07c36d08cc331');
    // await task.populate('owner').execPopulate();
    // console.log(task.owner)

    // const user = await User.findById('5e1ad00ecd53ab32e026170f');
    // await user.populate('tasks').execPopulate();
    // console.log(user.tasks)
// }

// main();

const multer = require('multer');
const upload = multer({
    dest : 'images',
    limits : {
        fileSize : 1000000
    },
    fileFilter(req, file, cb) {
        // if(!file.originalname.endsWith('.pdf')){
        //     return cb(new Error('Error : Please upload pdf file'));
        // }

        // if(!file.originalname.match(/\.(doc|docx)$/)){
        //     return cb(new Error('Error : Please upload a word doc'));
        // }

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Error : Please upload a file'));
        }
        cb(undefined, true)
    }
})

app.post('/uploads', upload.single('upload') , (req,res) => {
    res.send()
})
