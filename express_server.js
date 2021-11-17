const express = require("express");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const {getUserByEmail} = require('./helpers');
const PORT = 8080; // default port 8080

function generateRandomString(numberChars) { //passing in numberChars=6
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for ( let i = 0; i < numberChars ; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2a$10$LymJ6srui01KOwrrU9T/j.9wgQdpOPmBJzkHUu5FCPFwBE7bF5zIq" //purple-monkey-dinosaur
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$PthC5XZYs7nuxk5.o2VOKecDzoFWEOQy8h5EMWSqQnTNWIgZYAoKe" //dishwasher-funk
  }
}

const checkUser = function (users, emailUser, emailPassword){
  for (let user in users){
    if ((users[user].email === emailUser) && (users[user].password === emailPassword)) {
      return true; //user already exists
    }
  }
  return false; //user doesnt exist in users object
}

const getUserID = function (users, emailUser){
  for (let user in users){
    //console.log(email);
    if (users[user].email=== emailUser){
      //console.log(users[user].id)
      return users[user].id;
    }
  }
}

const registerUser = function(users, emailUser){
  for (let user in users){
    if (users[user].email === emailUser){
      return true;   
    }
  }
  return false;
}
//logged in user urls
const urlsUser = function (userid, urlDatabase){
  const newObjectDatabase={};
  for (let obj in urlDatabase){
    console.log(obj);
    if (urlDatabase[obj].userID === userid){
      newObjectDatabase[obj] = urlDatabase[obj];
    }
  }
  return newObjectDatabase;
}

const userOwner = function (userid, shortURL){
  if (urlDatabase[shortURL].userID === userid){
    return true;
  }
  else {
    return false;
  }
}

//handle POST request using body-parser library to make it readable
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  const userID = req.session['userID'];
  console.log("new string url: ", shortURL);
  urlDatabase[shortURL] = { longURL, userID };
  console.log(urlDatabase);
  //res.send("Ok");
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)

});
//URL Deleting
app.post('/urls/:shortURL/delete', (req, res) => {
  const userid = req.session['userID'];
  const shortURL = req.params.shortURL;
  const alloweduser = userOwner(userid, shortURL);
  if (alloweduser){
  delete urlDatabase[req.params.shortURL].longURL;
  res.redirect('/urls');
  }
  else{
    res.send("You are not allowed to access this page.");
  }
})

//URL Updating
app.post('/urls/:id/edit', (req, res) =>{
  const userid = req.session['userID'];
  const shortURL = req.params.id;
  const alloweduser = userOwner(userid, shortURL);
  if (alloweduser){
  console.log(`line45`, req.params.id);
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
  }
  else{
    res.send("You are not allowed to access this page.");
  }
})

//Logout route
app.post('/logout', (req, res) =>{
  // res.clearCookie("user_id");
  req.session = null;
  res.redirect('/urls');
})

//Login route
app.post('/login', (req, res) => {
  const email = req.body.loginemail;
  const password = req.body.password;

  const userFound = getUserByEmail(email, users);
  if (!userFound){
    res.status(403).send("User email does not exist.")
  }
  console.log(userFound);

  const hashCompare = bcrypt.compareSync(password, userFound.password); // returns true
  console.log(`comparing the hashes:`, hashCompare);
  if (!hashCompare){
    res.status(403).send("email or password is incorrect");
    return;
  }
    //res.cookie('user_id', userFound.id);
    req.session.userID = userFound.id;
    res.redirect ('/urls'); 
}); 

//Login NEW get
app.get('/login', (req,res) =>{
  const templateVars = { user:null}
  if (req.session["userID"]){
    res.redirect('/urls');
  }
  else{
    res.render('login', templateVars);
  }
})

//Creating Registration Page
app.get('/register', (req,res)=>{
  const templateVars = { user: null };
  return res.render('urls_register', templateVars);
})

//Register POST
app.post('/register', (req,res) =>{
  const randomId= generateRandomString(5);
  console.log(req.body.registeremail);
  const emailUser = req.body.registeremail;
  const passUser = req.body.password;
  const hashedPassword = bcrypt.hashSync(passUser, 10);
  const newUser = { id:randomId, email:emailUser, password:hashedPassword};
  if (emailUser === '' || passUser === ''){
      res.status(400)
      return res.send("User's password and/or email is missing");
  }

if (registerUser(users, emailUser)){
  res.status(400)
  return res.send("the email already exists.");
}
  users[randomId] = newUser;
  console.log(users);
  // res.cookie('user_id', randomId);
  req.session.userId = randomId;
  res.redirect('/urls');
})

// //Get route to ADD cookie 
// app.get('/login', (req, res) =>{
//   res.cookie(`Cookie token name`,`encrypted cookie string Value`);
//   res.send(`Cookie have been saved successfully`);
// })

//URL Shortening (PART 1)
//creating new route for user to GET request when visiting website/urls/new
app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  const templateVars = { user: user  };
  if (req.session['userID']){
    res.render("urls_new", templateVars);
  }
  else{
    res.redirect('/login');
  }
});
//URL Shortening (PART 2) redirecting from shortURL, longURL 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlDatabaseObject = urlDatabase[shortURL];
  if (urlDatabaseObject){
    const longURL = urlDatabaseObject.longURL;
    res.redirect(longURL); 
  }
  else{
    res.send("The id does not exist");
  }
});
//shorturL GET
app.get("/urls/:shortURL", (req, res) => {
  const idofUser = req.session.userID;
  const shortURL = req.params.shortURL;
  const alloweduser = userOwner(idofUser, shortURL);
  if (alloweduser) {
  const userObject = users[idofUser];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: userObject };
  res.render("urls_show", templateVars);
  }
  else{
    res.send("You are not allowed to access this page."); 
  }
});

//route handler to handle get request and response, uses urls as key to access within the template
app.get("/urls", (req, res) => {
  const userId = req.session.userID;
  console.log(`user id is: `,userId);
  if (userId){
    const urlUserObject = urlsUser(userId, urlDatabase);
    const user = users[userId];
    const templateVars = { urls: urlUserObject, user: user };
    return res.render("urls_index", templateVars);
  }
  else{
    res.redirect('/login');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});