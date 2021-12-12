const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.set("view engine", "ejs");
const bcrypt = require('bcryptjs');

function generateRandomString() {
  return Math.random().toString(36).slice(7);
}
let urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }

};

// const urlForUsers = (id, dataBase) => {
//   let userUrls = {};
//   for (let shortUrls in dataBase) {
//     if (dataBase[shortUrls].user_id === id) {
//       userUrls[shortUrls] = dataBase[shortUrls]; 
//     }
//   }
//   return userUrls;
// }

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}
const urlForUsers = (id, dataBase) => {
  let userUrls = {};
  for (let shortUrls in dataBase) {
    if (dataBase[shortUrls].userID === id) {
      userUrls[shortUrls] = dataBase[shortUrls].longURL; 
      console.log({ id, dataBase })
    }
    console.log({ id, dataBase })
  }
  return userUrls;
}

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
  let user_id = req.cookies.user_id;
//  userUrls = urlForUsers(user_id, urlDatabase)
//   const templateVars = { urls: userUrls, user: users[user_id] };
//   console.log(userUrls);
  if (!user_id) {
    return res.redirect('/login');
  }
  const userUrls = urlForUsers(user_id, urlDatabase)
  console.log(userUrls, "abcd");
  let templateVars = { urls: userUrls, user: users[user_id] };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.user_id;
  if (user_id) {
    const templateVars = { user: users[user_id] };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const user_id = req.cookies.user_id;
  if (!user_id) {
    return res.status(403).send("Please login");
  }
const userUrls = urlForUsers(user_id, urlDatabase)
const url = userUrls[shortURL]
if (!url) {
  return res.status(404).send("Url cannot be found");
}
const templateVars = { 
  urls: userUrls, 
  user: users[user_id],
  longURL: url.longURL,
  shortURL: shortURL,
 };
res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  if (!user_id) {
    return res.send("You need to log in or register.");
  } 
  const {longURL} = req.body
  const shortUrl = generateRandomString(); 
  urlDatabase = {...urlDatabase, [shortUrl]: {longURL, userID: user_id} }//copying urlDatabase

  console.log(req.body);  // Log the POST request body to the console
  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  // user: users[req.cookies["user_id"]]
  const shortURL = req.params.shortURL
  // console.log(shortURL)
  // const longURL = urlDatabase[shortURL]
  // res.redirect(longURL);
  // res.end("Hello shorturl")
  const url = urlDatabase[shortURL]
  if (!url) {
    return res.status(403).send("URL doesn't exist");
  }
  res.redirect(url.longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.cookies.user_id;
  const urlToDelete = req.params.shortURL
  if (!user_id) {
    return res.status(403).send("Please login");
  }
  const userUrls = urlForUsers(user_id, urlDatabase)
  const url = userUrls[urlToDelete]
  if (!url) {
    return res.status(404).send("Url cannot be found");
  }
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
  const email = req.body.email;
  const password = req.body.password;

  const storedPassword = bcrypt.hashSync("123", 10);
  console.log('storedPassword', storedPassword)

  // bcrypt.compareSync("123", hashedPassword); // returns true
  // bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false

  // try to find a user by email address
  const userOrFalse = findUserByEmail(email, users);
  if (!userOrFalse) {
    return res.status(403).send("Your email cannot be found");
  } 

  // if user found...
  const user = userOrFalse;

  // compare password
  const isPasswordMatched = bcrypt.compareSync("123", storedPassword);
  console.log('isPasswordMatched', isPasswordMatched);

  if (password !== user.password) {
    return res.status(403).send("Your password doesn't match");
  }
  
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase};
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
const password = "123"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);
  let email = req.body.email;
  // let password = req.body.password;
//Create a Registration Handler
  if(!email || !password) return res.status(400).send('Wrong credentials')

  const userObject = findUserByEmail(email, users)

  if(userObject) return res.status(400).send('Email is taken')

  const randomUserID = generateRandomString()
  console.log('random user ID', randomUserID)
  const newUser = {
    id: randomUserID,
    email: email,
    password: password
  }

  users[randomUserID] = newUser
  res.cookie('user_id', randomUserID)
  res.redirect('/urls')
});

// returns user object if email match means user exists in userDB
function findUserByEmail(email, userDB) {
  for(const user in userDB) {
    if(userDB[user].email === email) return userDB[user]
  }
  return false
}
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});
