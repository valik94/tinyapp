const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString(str) {
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for ( let i = 0; i < str.length; i++ ) {
      result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//URL Shortening (PART 1)
//creating new route for user to GET request when visiting website/urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//handle POST request using body-parser library to make it readable
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  shortURL = generateRandomString(6);
  console.log("new string url: ", shortURL);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//route handler to handle get request and response, uses urls as key to access within the template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// app.get("/urls/:id", (req, res) => {
//   console.log(req.params);
//   const templateVars = { urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  console.log(urlDatabase[req.params.shortURL]);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});