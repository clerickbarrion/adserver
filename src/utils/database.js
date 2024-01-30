const mysql = require('mysql2');

const con = mysql.createPool({connectionLimit:40,host:"mysql-firstdatabase.a.aivencloud.com",user:"avnadmin",password:"AVNS_0_kU7u6jfeHt_73D6Du", database: "astroid_destroyer",port:25475,})

function getScores(){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if(err) reject(err);
            connection.query("SELECT * FROM leaderboard ORDER BY score DESC", (err,rows)=>{
                if(err) reject(err);
                resolve(rows);
                connection.release();
            })
        })
    })
}

function addScore(username,score){
    con.getConnection((err,connection)=>{
        if(err) throw(err);
        connection.query(`INSERT INTO leaderboard (username,score) VALUES ('${username}',${score})`, (err,rows)=>{
            if(err) throw(err);
            connection.release();
        })
    })
}

function getDiscussions(){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if(err) reject(err);
            connection.query("SELECT * FROM discussions", (err,rows)=>{
                if(err) reject(err);
                resolve(rows);
                connection.release();
            })
        })
    })

}

function getComments(){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if(err) reject(err);
            connection.query("SELECT * FROM comments", (err,rows)=>{
                if(err) reject(err);
                resolve(rows);
                connection.release();
            })
        })
    })
}

function addDiscussion(username,section,title,date,content){
    con.getConnection((err,connection)=>{
        if(err) throw(err);
        connection.query(`INSERT INTO discussions (username,section,title,date,content) VALUES ('${username}','${section}','${title}','${date}','${content}')`, (err,rows)=>{
            if(err) throw(err);
            connection.release();
        })
    })
}

function addComment(username,date,content,discussion_id){
    con.getConnection((err,connection)=>{
        if(err) throw(err);
        connection.query(`INSERT INTO comments (username,date,content,discussion_id) VALUES ('${username}','${date}','${content}',${discussion_id})`, (err,rows)=>{
            if(err) throw(err);
            connection.release();
        })
    })
}

function signUp(username,password){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if(err) reject(err);
            connection.query(`SELECT * FROM accounts WHERE username='${username}'`, (err,rows)=>{
                if(err) reject(err);
                if(rows.length){
                    reject({error: "Username already exists"})
                    connection.release();
                } else {
                    connection.query(`INSERT INTO accounts (username,password) VALUES ('${username}','${password}')`, (err,rows)=>{
                        if(err) reject(err);
                        connection.release();
                        resolve({success: "Account created successfully"});
                    })
                }
            })
        })
    
    })
}

function login(username,password){
    return new Promise((resolve,reject)=>{
        con.getConnection((err,connection)=>{
            if(err) reject(err);
            connection.query(`SELECT * FROM accounts WHERE username='${username}'`, (err,rows)=>{
                if(err) reject(err);
                if(rows.length){
                    if(rows[0].password === password){
                        resolve({success: "Login successful"});
                    } else {
                        reject({error: "Incorrect password"})
                    }
                    connection.release();
                } else {
                    reject({error: "Username does not exist"})
                }
            })
        })
    })
}

module.exports = {getScores,addScore,getDiscussions,getComments,addDiscussion,addComment,signUp,login}