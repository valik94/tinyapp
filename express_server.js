const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const checkUser = function (users, emailUser){
  for (let email in users){
    if (users[email].email === emailUser) {
      return true;
    }
  }
  return false;
}

//handle POST request using body-parser library to make it readable
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const longurl = req.body.longURL;
  const shortURL = generateRandomString(6);
  console.log("new string url: ", shortURL);
  urlDatabase[shortURL] = longurl;
  console.log(urlDatabase);
  //res.send("Ok");
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
  //res.redirect(longurl); //redirecting longurl

});
//URL Deleting
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

//URL Updating
app.post('/urls/:id/edit', (req, res) =>{
  console.log(`line45`, req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
})

//Login route
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect ('/urls');
}); 

//Logout route
app.post('/logout', (req, res) =>{
  res.clearCookie("user_id");
  res.redirect('/urls');
})

//Creating Registration Page
app.get('/register', (req,res)=>{
  const templateVars = { urls: urlDatabase, user: null };
  return res.render('url_register', templateVars);
})

//Register POST
app.post('/register', (req,res) =>{
  const randomId= generateRandomString(5);
  console.log(req.body.registeremail);
  const emailUser = req.body.registeremail;
  const passUser = req.body.password;
  const newUser = { id:randomId, email:emailUser, password:passUser};
  if (emailUser === '' || passUser === ''){
      res.status(400)
      return res.send("User's password and/or email is missing");
  }

if (checkUser(users, emailUser)){
  res.status(400)
  return res.send("the email already exists.");
}

  users[randomId] = newUser;
  console.log(users);
  res.cookie('user_id', randomId);
  res.redirect('/urls');
})

//Get route to ADD cookie 
app.get('/login', (req, res) =>{
  res.cookie(`Cookie token name`,`encrypted cookie string Value`);
  res.send(`Cookie have been saved successfully`);
})

//URL Shortening (PART 1)
//creating new route for user to GET request when visiting website/urls/new
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user  };
  res.render("urls_new", templateVars);
});
//URL Shortening (PART 2) redirecting from shortURL, longURL 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
//shorturL GET
app.get("/urls/:shortURL", (req, res) => {
  const idofUser = req.cookies.user_id;
  const userObject = users[idofUser];
  console.log(req.params.shortURL);
  console.log(urlDatabase[req.params.shortURL]);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: userObject };
  res.render("urls_show", templateVars);
});

//route handler to handle get request and response, uses urls as key to access within the template
app.get("/urls", (req, res) => {
  const userId =req.cookies.user_id
  if (userId){
    const user = users[userId];
    const templateVars = { urls: urlDatabase, user: user };
    return res.render("urls_index", templateVars);
  }
  res.redirect('/login');

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});