const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth')
const router = new express.Router();

//To fetch all tasks at a time
// router.get('/tasks',auth , async (req,res) => {
//     try{
//         // const tasks = await Task.find({ owner : req.user._id});
//         // res.status(200).send(tasks);
//         const user = await req.user.populate('tasks').execPopulate();
//         res.status(200).send(user.tasks);
//     } catch(e) {
//         res.status(500).send(e);
//     }
// })

// To fileter task based on completed or not
router.get('/tasks',auth , async (req,res) => {
    const match = {};
    const sort = {};
    if(req.query.completed){
        match.completed = req.query.completed
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try{
        const user = await req.user.populate({
            path : 'tasks',
            match,
            options : {
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                // sort : {
                //     // createdAt : -1 // for new(1) or old(-1) task
                //     completed : 1 
                // }
                sort
            }
        }).execPopulate();
        res.status(200).send(user.tasks);
    } catch(e) {
        res.status(500).send(e);
    }
})

router.post('/tasks', auth, (req,res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner : req.user._id
    });
    task.save().then((t) => {
        res.status(201).send(t);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

module.exports = router;