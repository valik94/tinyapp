const express = require("express");
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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

//URL Shortening (PART 1)
//creating new route for user to GET request when visiting website/urls/new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//URL Shortening (PART 2) redirecting from shortURL, longURL 
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  console.log(urlDatabase[req.params.shortURL]);
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//route handler to handle get request and response, uses urls as key to access within the template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});