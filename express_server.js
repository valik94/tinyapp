const express = require("express");
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const app = express();
const {getUserByEmail, registerUser, urlsUser, userOwner, generateRandomString} = require('./helpers');
const PORT = 8080; // default port 8080



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

//Home Page redirect
app.get('/', (req,res) => {
  res.redirect('/urls');
})

//handle POST request using body-parser library to make it readable
app.post("/urls", (req, res) => {
  const userID = req.session['userID'];
  if(userID){
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(6);
    
    urlDatabase[shortURL] = { longURL, userID };
    //res.send("Ok");
    return res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
  }
  res.redirect(`/login`);
});
//shortURL Deleting
app.post('/urls/:shortURL/delete', (req, res) => {
  const userid = req.session['userID'];
  const shortURL = req.params.shortURL;
  const alloweduser = userOwner(userid, shortURL, urlDatabase);
  if (alloweduser){
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  }
  else{
    res.send("You are not allowed to access this page.");
  }
})

//URL Updating/Editing
app.post('/urls/:id/edit', (req, res) =>{
  const userid = req.session['userID'];
  const shortURL = req.params.id;
  const alloweduser = userOwner(userid, shortURL, urlDatabase);
  if (alloweduser){
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
  }
  else{
    res.send("You are not allowed to access this page.");
  }
})

//Logout route
app.post('/logout', (req, res) =>{
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

  const hashCompare = bcrypt.compareSync(password, userFound.password); // returns true
  if (!hashCompare){
    res.status(403).send("email or password is incorrect");
    return;
  }
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
  const userId = req.session.userID;
  if (!userId){
  const templateVars = { user: null };
  return res.render('urls_register', templateVars);
  }
  res.redirect('/urls');
})

//Register POST
app.post('/register', (req,res) =>{
  const randomId= generateRandomString(5);
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
  req.session.userId = randomId;
  res.redirect('/urls');
})


//URL Shortening (PART 1)
//creating new route for user to GET request when visiting website/urls/new
app.get("/urls/new", (req, res) => {
  const userId = req.session.userID;
  const user = users[userId];
  const templateVars = { user: user };
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
//shortURL GET route
app.get("/urls/:shortURL", (req, res) => {
  const idofUser = req.session.userID;
  const shortURL = req.params.shortURL;
  const alloweduser = userOwner(idofUser, shortURL, urlDatabase);
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