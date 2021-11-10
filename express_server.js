const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

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
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

// app.get("/hello", (req, res) => {
//   const templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});