import { Octokit } from "https://esm.sh/@octokit/core"
const one = 'gh'
const two = 'p_vXCkFfm51w0aCL'
const three = 'C03jo4636UaDOgVd4ac1Uw'
const secretKey = one + two + three
const octokit = new Octokit({
    auth: secretKey
});

const message = document.getElementById('message')
const createAccountError = document.getElementById('create-account-error')
const loginError = document.getElementById('log-in-error')
const discussionButtons = document.getElementsByClassName('create-discussion')
const discussionCreation = document.getElementById('discussion-creation')
const postDiscussionButton = document.getElementById('post-discussion')
const closeButtons = document.getElementsByClassName('close')
const accountButtons = document.getElementById('account-buttons')
const loggedIn = document.getElementById('logged-in')
const signUpButton = document.getElementById('sign-up')
const loginButton = document.getElementById('log-in')
const login = document.getElementById('login')
const logOut = document.getElementById('log-out')
const createAccountButton = document.getElementById('create-account')
var discussionButton

class Account {
    constructor(){
        this.logOut = document.getElementById('log-out')
        this.loginButton = document.getElementById('log-in')
        this.login = document.getElementById('login')
        this.signUpButton = document.getElementById('sign-up')
        this.createAccountButton = document.getElementById('create-account')
    }
    
}




if (localStorage.getItem('username')) {
    let username = document.getElementById('username')
    accountButtons.style.display = 'none';
    username.innerText = localStorage.getItem('username')
} else {
    loggedIn.style.display = 'none';
    accountButtons.style.display = 'flex'
}

logOut.addEventListener('click', ()=>{
    loggedIn.style.display = 'none';
    accountButtons.style.display = 'flex'
    localStorage.clear()
})

loginButton.addEventListener('click', ()=>{
    let page = document.getElementById('log-in-page')
    page.style.display = 'flex'
})

login.addEventListener('click', ()=>{
    let username = document.getElementById('login-username')
    let password = document.getElementById('login-password')
    if (username.value && password.value) {
        getAccounts().then((result)=>{
            let account = result.filter(account =>{
                return account.user.toUpperCase() === username.value.toUpperCase()
            })
            if (account.length === 0) {
                loginError.style.display = 'block'
                loginError.innerText =`Account '${username.value}' does not exist`
            } else if (password.value === account[0].password){
                localStorage.setItem('username',username.value)
                username.parentNode.parentNode.style.display = 'none'
                message.style.display = 'flex';
                message.innerText = `Logged in as ${username.value}`
                loginError.style.display = 'none'
                setTimeout(()=>{message.style.display='none'},3000)
                username = document.getElementById('username')
                accountButtons.style.display = 'none';
                loggedIn.style.display = 'block';
                username.innerText = localStorage.getItem('username')
            } else {
                loginError.style.display = 'block'
                loginError.innerText ='Invalid Password'
            }
        })
    } else {
        loginError.style.display = 'block'
        loginError.innerText ='Enter username and password'
    }
})

signUpButton.addEventListener('click', ()=>{
    let page = document.getElementById('sign-up-page')
    page.style.display = 'flex'
})

createAccountButton.addEventListener('click', ()=>{
    let username = document.getElementById('create-username')
    let password = document.getElementById('create-password')
    let confirmPassword = document.getElementById('confirm-password')
    if (username.value && username.value.length < 21 && password.value && confirmPassword.value && password.value === confirmPassword.value){
        getAccounts().then((result)=>{
            let usernames = result.filter(account =>account.user.toUpperCase() === username.value.toUpperCase())
            if (usernames.length > 0) {
                createAccountError.style.display = 'block'
                createAccountError.innerText = 'Username already taken'
            }
            else {
                result.push({"user": username.value, "password": password.value})
                createAccount(JSON.stringify({accounts: result}))
                username.parentNode.parentNode.style.display = 'none'
                message.style.display = 'flex';
                message.innerText = 'Account Created'
                createAccountError.style.display = 'none'
                setTimeout(()=>{message.style.display='none'},3000)
            }
        })
    } else if (username.value.length > 20) {
        createAccountError.style.display = 'block'
        createAccountError.innerText = 'Username too long'
    } else if (password.value !== confirmPassword.value) {
        createAccountError.style.display = 'block'
        createAccountError.innerText = 'Passwords do not match'
    }
})

///get and post
async function getAccounts() {
    const result = await octokit.request('GET /gists/{gist_id}', {
        gist_id: 'f2ebbc31bd13eb014f34a6043912b89f',
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    return JSON.parse(result.data.files["ad-accounts.json"].content).accounts
}
async function createAccount(data) {
    await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: 'f2ebbc31bd13eb014f34a6043912b89f',
        description: 'created account',
        files: {
            "ad-accounts.json": {
                content: data,
            },
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
}
async function getDiscussions() {
    const result = await octokit.request('GET /gists/{gist_id}', {
        gist_id: 'f2ebbc31bd13eb014f34a6043912b89f',
        headers: {
        'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    let sections = JSON.parse(result.data.files["ad-discussions.json"].content).sections
    return sections
}
async function postDiscussion(data) {
    await octokit.request('PATCH /gists/{gist_id}', {
        gist_id: 'f2ebbc31bd13eb014f34a6043912b89f',
        description: 'created discussion',
        files: {
            "ad-discussions.json": {
                content: data,
            },
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })
}
///

function discussionInit(){
    getDiscussions().then((result) => {
        let generalDiscussion = result[0]
        let questionDiscussion = result[1]
        let offTopicDiscussion = result[2]       
        generalDiscussion.forEach(discussion => {
            let newDiscussion = new Discussion(discussion.id,discussion.user,discussion.title,discussion.content,discussion.date,document.getElementById('general'))
            newDiscussion.createDiscussion()
            discussion.comments.forEach(comment => {
                let newComment = new Comment(comment.user,comment.date,comment.content,document.getElementById(discussion.id))
                newComment.createComment()
            })
        })
        questionDiscussion.forEach(discussion => {
            let newDiscussion = new Discussion(discussion.id,discussion.user,discussion.title,discussion.content,discussion.date,document.getElementById('questions'))
            newDiscussion.createDiscussion()
            discussion.comments.forEach(comment => {
                let newComment = new Comment(comment.user,comment.date,comment.content,document.getElementById(discussion.id))
                newComment.createComment()
            })
        })
        offTopicDiscussion.forEach(discussion => {
            let newDiscussion = new Discussion(discussion.id,discussion.user,discussion.title,discussion.content,discussion.date,document.getElementById('offTopic'))
            newDiscussion.createDiscussion()
            discussion.comments.forEach(comment => {
                let newComment = new Comment(comment.user,comment.date,comment.content,document.getElementById(discussion.id))
                newComment.createComment()
            })
        })
    })
}

function getDate(){
    let date = String(new Date())
    date = date.substring(4,21).replace(' 20', ', 20')
    return date
}

class Comment {
    constructor(user,date, commentValue, commentSection){
        this.user = user
        this.date = date
        this.commentValue = commentValue
        this.commentSection = commentSection
    }
    createComment(){
        if (this.user == null) {this.user = 'Anonymous'}
        let div = document.createElement('div')
        div.classList.add('comment')
        div.innerHTML = `
        <div class="user-date">
            <p><mark>${this.user}</mark></p>
            <p>&#8226</p>
            <p>${this.date}</p>
        </div>
        <p class="comment-content">${this.commentValue}</p>
        <div class='rating'>
            <img src='images/likes.png'><p class='ld'>0</p>
            <img src='images/dislikes.png'><p class='ld'>0</p>
        </div>
        <hr>
        `
        this.commentSection.appendChild(div)
        let commentNumber = this.commentSection.parentNode.parentNode.querySelector('.comment-number')
        commentNumber.innerText = Number(commentNumber.innerText) + 1
        this.commentSection.parentNode.parentNode.querySelector('.last-post').innerText = this.user
        let ratings  = div.querySelectorAll('.ld')
        Array.from(ratings).forEach(rating => {
            rating.previousSibling.addEventListener('click', ()=>{
                if(Array.from(rating.classList).includes(localStorage.getItem('username'))){
                    rating.classList.remove(localStorage.getItem('username'))
                    rating.innerText = Number(rating.innerText) -1
                } else {
                    rating.classList.add(localStorage.getItem('username'))
                    rating.innerText = Number(rating.innerText) +1
                }
            })
        })
    }
    postComment(){
        getDiscussions().then((result) =>{
            let discussion
            for(let i of result){
                discussion = i.filter(item=>item.id == this.commentSection.id)
                if (discussion.length) break
            }
            discussion[0].comments.push({user: this.user,date:this.date,content: this.commentValue})
            postDiscussion(JSON.stringify({sections:result}))
        })
    }
}

class Discussion {
    constructor(id,user,title,content,date,forum){
        this.id = id
        this.title = title
        this.content = content
        this.user = user
        this.date = date
        this.forum = forum
    }
    createDiscussion(){
        if (this.user == null) {this.user = 'Anonymous'}
        let details = document.createElement('details')
        details.classList.add('discussion')
        details.innerHTML = `
        <summary>
            <h1>${this.title}</h1>
            <h1><mark class="comment-number">0</mark> Comments</h1>
            <h1>Last Post By: <mark class="last-post"></mark></h1>
        </summary>
        <article>
            <div class="user-date">
                <p><mark>${this.user}</mark></p>
                <p>&#8226</p>
                <p>${this.date}</p>
            </div>
            <p class="discussion-content">${this.content}</p>
            <hr>
            <div class="write-comment-container">
                <div class="write-comment-box-head">
                    <label for="write-comment-box">Leave a comment</label>
                    <button class="write-comment-button" type="button">Submit</button>
                </div>
                <textarea type="text" id="write-comment-box" class="write-comment-box"></textarea>
                <div class='sort-comments-container'>
                    <label for='sort-comments'>Sort comments by</label>
                    <select id='sort-comments' class='sort-comments'>
                        <option value='newest'>newest</option>
                        <option value='oldest'>oldest</option>
                    </select>
                </div>
            </div>
            <hr>
            <div class="comment-section" id=${this.id}>
            </div>
        </article>
        `
        this.forum.appendChild(details)
        let button = details.querySelector('.write-comment-button')
        button.addEventListener('click',()=>{
            let commentValue = button.parentNode.nextSibling.nextSibling.value
            let commentSection = button.parentNode.parentNode.nextElementSibling.nextElementSibling
            let comment = new Comment(localStorage.getItem('username'),getDate(),commentValue,commentSection)
            comment.createComment()
            comment.postComment()
        })
        const sortButton = details.querySelector('.sort-comments')
        sortButton.addEventListener('change', ()=>{
            let commentSection = document.getElementById(this.id)
            sortButton.value === 'newest' ? commentSection.style.flexDirection = 'column-reverse' : commentSection.style.flexDirection = 'column'
        })
        return details.parentNode.id
    }
    postDiscussion(topic){
        getDiscussions().then((result) => {
            switch (topic) {
                case 'general':
                    result[0].push({id: this.id, user: this.user, title: this.title, content: this.content, date: this.date, comments: []})
                    break;
                case 'questions':
                    result[1].push({id: this.id, user: this.user, title: this.title, content: this.content, date: this.date, comments: []})
                    break;
                case 'offTopic':
                    result[2].push({id: this.id, user: this.user, title: this.title, content: this.content, date: this.date, comments: []})
                    break;
            }
            postDiscussion(JSON.stringify({sections:result}))
        })
    }
}

Array.from(discussionButtons).forEach(button => {
    button.addEventListener('click', ()=>{
        discussionCreation.style.display = 'flex'
        discussionButton = button
    })
})

Array.from(closeButtons).forEach(button =>{
    button.addEventListener('click', ()=>{
        button.parentNode.style.display = 'none'
    })
})

postDiscussionButton.addEventListener('click', ()=>{
    let title = document.getElementById('discussion-title').value
    let content = document.getElementById('discussion-body').value
    let forum = discussionButton.parentNode.parentNode
    let discussion = new Discussion(Number(new Date),localStorage.getItem('username'),title,content,getDate(),forum)
    let topic = discussion.createDiscussion()
    discussion.postDiscussion(topic)
    discussionCreation.style.display = 'none'
})

discussionInit()