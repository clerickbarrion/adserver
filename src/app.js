const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const fetch = require('node-fetch');
const database = require('./utils/database.js');


app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/getScores', async (req, res) => {
    const scores = await database.getScores().then(scores=>scores).catch(err =>err);
    res.write(JSON.stringify(scores))
    res.end()
})

app.post('/api/addScore', async (req, res) => {
    const {username,score} = req.body;
    database.addScore(username,Number(score))
})

app.get('/api/getDiscussions', async (req, res) => {
    const discussions = await database.getDiscussions().then(discussions=>discussions).catch(err =>err);
    res.write(JSON.stringify(discussions))
    res.end()
})

app.get('/api/getComments', async (req, res) => {
    const comments = await database.getComments().then(comments=>comments).catch(err =>err);
    res.write(JSON.stringify(comments))
    res.end()
})

app.post('/api/addDiscussion', async (req, res) => {
    const {username,section,title,date,content} = req.body;
    database.addDiscussion(username,section,title,date,content)
    res.end()
})

app.post('/api/addComment', async (req, res) => {
    const {username,date,content,discussion_id} = req.body;
    database.addComment(username,date,content,Number(discussion_id))
    res.end()
})

app.post('/api/signUp', async (req, res) => {
    const {username,password} = req.body;
    const result = await database.signUp(username,password).then(result=>result).catch(err =>err);
    res.write(JSON.stringify(result))
    res.end()
})

app.get('/api/login', async (req, res) => {
    const {username,password} = req.query;
    const result = await database.login(username,password).then(result=>result).catch(err =>err);
    res.write(JSON.stringify(result))
    res.end()
})

app.listen(port)