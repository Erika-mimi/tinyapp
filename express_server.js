const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");

function generateRandomString() {
  Math.random().toString(36).slice(7);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.redirect('/urls');
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("urls_show", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username};
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL
  console.log(shortURL)
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
  // res.end("Hello shorturl")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL
  delete urlDatabase[urlToDelete]
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  // const req.params.shortURL = urlDatabase[req.body]
  const updateNewUrl = req.body.new_url
  const shortUrl = req.params.shortURL
  urlDatabase[shortUrl] = updateNewUrl
  console.log("user entered this url", req.body)
  console.log("updating this short url", req.params.shortURL)
  res.redirect("/urls");
})
app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});
