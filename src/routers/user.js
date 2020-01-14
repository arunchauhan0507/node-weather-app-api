const express = require('express');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth')
const sendEmail = require('../emails/accounts')
const multer = require('multer');
const router = new express.Router();


router.post('/users', async (req,res) => {
    // console.log(req.body);
    try{
        const user = new User(req.body)
        await user.save();
        sendEmail.sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken();
        console.log(token)
        res.status(200).send({user, token});
    } catch(e) {
        res.status(400).send(e)
    }

    // user.save().then((r) => {
    //     res.status(201).send(r);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // })
})


// router.get('/users',(req, res) => {
//     User.find({}).then((users) => {
//         res.send(users);
//     }).catch((e)=> {
//         res.status(400).send(e);
//     })
// })

router.post('/users/login' , async (req,res) => {
    try{
        const email = req.body.email;
        const password = req.body.password
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ user, token})
    } catch(e){
        res.status(400).send(e)
    }
})

router.get('/users', async (req, res) => {

    try{
        const users = await User.find({});
        res.status(200).send(users);
    } catch(e) {
        res.status(400).send(e);
    }

        // User.find({}).then((users) => {
        //     res.send(users);
        // }).catch((e)=> {
        //     res.status(400).send(e);
        // })
})

router.get('/users/me', auth ,async (req, res) => {
    res.send(req.user)
})

router.post('/user/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return req.token !== token.token
        });
        await req.user.save();
        res.status(200).send('Logout');
    } catch(e) {
        // console.log(e)
        res.status(500).send(e)
    }

    // req.user.tokens = req.users.tokens.filter((token) =>  req.token !== token.token);
    // req.user.save().then((res) => {

    //  }).catch((e) => {
    //      console
    //  })
})
    
router.post('/users/logoutAll', auth, async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save();
        res.send('Logout');
    } catch(e) {
        res.send(e)
    }

})

// router.get('/user/:id',(req, res) => {
//     const _id = req.params.id;
//     User.findById(_id).then((user) => {
//         if(!user){
//             res.send('User with given Id not found')
//         }
//         res.send(user);
//     }).catch((e)=> {
//         res.status(400).send(e);
//     })
// })

router.get('/user/:id', async (req, res) => {
    try{
        const _id = req.params.id;
        const user = await User.findById(_id);
        if(!user){
            res.send('User with given Id not found')
        }
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
})

//To update user

router.patch('/user/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email', 'password','age'];

    // const isVallidOperation = updates.every((update) => allowedUpdates.includes(update));
    const isVallidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    })

    if(!isVallidOperation){
        return res.status(400).send({ error : "Invallid updates!"})
    }
    try{
        const _id = req.params.id;
        // const user = await User.findByIdAndUpdate(_id, req.body ,{ new : true, runValidators : true});
        const  user = await User.findById(_id);

        updates.forEach((update) => {
            user[update] = req.body[update];
        })

        await user.save();

        if(!user){
            res.send('User with given Id not found')
        }
        res.send(user);
    } catch (e) {
        res.status(404).send(e);
    } 
})


// to delete user
router.delete('/users/:id', async (req, res) => {
    try{
        const _id = req.params.id;
        const user = await User.findByIdAndDelete(_id);
        if(!user){
            res.send('User with given Id not found')
        }
        res.send(user);

    } catch (e) {
        res.status(404).send(e);
    } 
})

// to delete user with all created tasks
router.delete('/remove/me',auth ,async (req, res) => {
    try{
        sendEmail.sendAccCancelEmail(req.user.email, req.user.name)
        await req.user.remove();
        res.status(200).send({message :"User Deleteed"});
    } catch (e) {
        res.status(404).send(e);
    } 
})

//To upload user image
const upload = multer({
    // dest : 'avatars',  //commented if we want to store image in db
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

//add avatar image authenticated
router.post('/users/me/avatar',auth, upload.single('avatar'), async (req,res) =>{
    // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer).resize({ width : 250 , height : 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
},(e, req,res,next)=> {
    res.send({ error : e.message})
})

//remove avatar image authenticated
router.delete('/users/me/avatar',auth, async (req,res) =>{
    req.user.avatar = undefined;
    req.user.save(); 
    res.send();
},(e, req,res,next)=> {
    res.send({ error : e.message})
})

//Get login user image 
router.get('/users/:id/avatar', async (req,res) =>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            res.status(300).send('User or user user avatar not found')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(500).send(e)
    }
})



module.exports = router;



