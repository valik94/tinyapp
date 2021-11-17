"use strict";

var express = require("express");

var bcrypt = require('bcryptjs');

var cookieParser = require('cookie-parser');

var app = express();
var PORT = 8080; // default port 8080

function generateRandomString(numberChars) {
  //passing in numberChars=6
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';

  for (var i = 0; i < numberChars; i++) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }

  return result;
}

app.set("view engine", "ejs");
app.use(cookieParser());
var urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({
  extended: true
}));
var users = {
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
};

var checkUser = function checkUser(users, emailUser, emailPassword) {
  for (var user in users) {
    if (users[user].email === emailUser && users[user].password === emailPassword) {
      return true; //user already exists
    }
  }

  return false; //user doesnt exist in users object
};

var getUserID = function getUserID(users, emailUser) {
  for (var user in users) {
    //console.log(email);
    if (users[user].email === emailUser) {
      //console.log(users[user].id)
      return users[user].id;
    }
  }
};

var registerUser = function registerUser(users, emailUser) {
  for (var user in users) {
    if (users[user].email === emailUser) {
      return true;
    }
  }

  return false;
}; //logged in user urls


var urlsUser = function urlsUser(userid, urlDatabase) {
  var newObjectDatabase = {};

  for (var obj in urlDatabase) {
    console.log(obj);

    if (urlDatabase[obj].userID === userid) {
      newObjectDatabase[obj] = urlDatabase[obj];
    }
  }

  return newObjectDatabase;
};

var userOwner = function userOwner(userid, shortURL) {
  if (urlDatabase[shortURL].userID === userid) {
    return true;
  } else {
    return false;
  }
};

var findUserByEmail = function findUserByEmail(users, emailUser) {
  for (var user in users) {
    if (users[user].email === emailUser) {
      return users[user];
    }
  }

  return null;
}; //handle POST request using body-parser library to make it readable


app.post("/urls", function (req, res) {
  console.log(req.body); // Log the POST request body to the console

  var longURL = req.body.longURL;
  var shortURL = generateRandomString(6);
  var userID = req.cookies['user_id'];
  console.log("new string url: ", shortURL);
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userID
  };
  console.log(urlDatabase); //res.send("Ok");

  res.redirect("/urls/".concat(shortURL)); // Respond with 'Ok' (we will replace this)
}); //URL Deleting

app.post('/urls/:shortURL/delete', function (req, res) {
  var userid = req.cookies['user_id'];
  var shortURL = req.params.shortURL;
  var alloweduser = userOwner(userid, shortURL);

  if (alloweduser) {
    delete urlDatabase[req.params.shortURL].longURL;
    res.redirect('/urls');
  } else {
    res.send("You are not allowed to access this page.");
  }
}); //URL Updating

app.post('/urls/:id/edit', function (req, res) {
  var userid = req.cookies['user_id'];
  var shortURL = req.params.id;
  var alloweduser = userOwner(userid, shortURL);

  if (alloweduser) {
    console.log("line45", req.params.id);
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send("You are not allowed to access this page.");
  }
}); //Logout route

app.post('/logout', function (req, res) {
  res.clearCookie("user_id");
  res.redirect('/urls');
}); //Login route

app.post('/login', function (req, res) {
  var email = req.body.loginemail;
  var password = req.body.password;
  var userFound = findUserByEmail(users, email);
  console.log(userFound);
  var hashCompare = bcrypt.compareSync(password, userFound.password); // returns true

  console.log("comparing the hashes:", hashCompare);

  if (hashCompare) {
    res.cookie('user_id', userFound.id);
    res.redirect('/urls');
  } else {
    res.status(403).send("email or password is incorrect");
  }
}); //Login NEW get

app.get('/login', function (req, res) {
  var templateVars = {
    user: null
  };

  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
  }
}); //Creating Registration Page

app.get('/register', function (req, res) {
  var templateVars = {
    user: null
  };
  return res.render('urls_register', templateVars);
}); //Register POST

app.post('/register', function (req, res) {
  var randomId = generateRandomString(5);
  console.log(req.body.registeremail);
  var emailUser = req.body.registeremail;
  var passUser = req.body.password;
  var hashedPassword = bcrypt.hashSync(passUser, 10);
  var newUser = {
    id: randomId,
    email: emailUser,
    password: hashedPassword
  };

  if (emailUser === '' || passUser === '') {
    res.status(400);
    return res.send("User's password and/or email is missing");
  }

  if (registerUser(users, emailUser)) {
    res.status(400);
    return res.send("the email already exists.");
  }

  users[randomId] = newUser;
  console.log(users);
  res.cookie('user_id', randomId);
  res.redirect('/urls');
}); // //Get route to ADD cookie 
// app.get('/login', (req, res) =>{
//   res.cookie(`Cookie token name`,`encrypted cookie string Value`);
//   res.send(`Cookie have been saved successfully`);
// })
//URL Shortening (PART 1)
//creating new route for user to GET request when visiting website/urls/new

app.get("/urls/new", function (req, res) {
  var userId = req.cookies.user_id;
  var user = users[userId];
  var templateVars = {
    user: user
  };

  if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
}); //URL Shortening (PART 2) redirecting from shortURL, longURL 

app.get("/u/:shortURL", function (req, res) {
  var shortURL = req.params.shortURL;
  var urlDatabaseObject = urlDatabase[shortURL];

  if (urlDatabaseObject) {
    var longURL = urlDatabaseObject.longURL;
    res.redirect(longURL);
  } else {
    res.send("The id does not exist");
  }
}); //shorturL GET

app.get("/urls/:shortURL", function (req, res) {
  var idofUser = req.cookies.user_id;
  var shortURL = req.params.shortURL;
  var alloweduser = userOwner(idofUser, shortURL);

  if (alloweduser) {
    var userObject = users[idofUser];
    var templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: userObject
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("You are not allowed to access this page.");
  }
}); //route handler to handle get request and response, uses urls as key to access within the template

app.get("/urls", function (req, res) {
  var userId = req.cookies.user_id;
  console.log("user id is: ", userId);

  if (userId) {
    var urlUserObject = urlsUser(userId, urlDatabase);
    var user = users[userId];
    var templateVars = {
      urls: urlUserObject,
      user: user
    };
    return res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});
app.listen(PORT, function () {
  console.log("Example app listening on port ".concat(PORT, "!"));
});