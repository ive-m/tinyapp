const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const users = [];

function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log("Url Database", urlDatabase);
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,username: req.cookies["username"], longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const randomString = generateRandomString();
  urlDatabase[randomString] = longURL;//add to database
  res.send(res.redirect(`/urls/${randomString}`)); // redirect
  
});


app.post("/login", (req, res) => {

  console.log(req.body);//require(body-parser)
  console.log(req.body.username);
  res.cookie("username", req.body.username);
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
 //res.render("partials/_header", templateVars);
 // res.render("urls", templateVars);
  //res.render("urls/new", templateVars);
  //res.render("urls/show", templateVars);
 //res.render("urls_index", templateVars);
  res.redirect(`/urls`); // redirect
  
});

app.post('/sign-out', (req, res) => {
  res.clearCookie('username'); // Tell the browser to delete this cookie.
  res.redirect('/');
});
//app.get('/login', (req, res) => {
//  if(req.cookies.user===user){const templateVAr={user = user} res.render()}
//});
app.post("/urls/:id/delete", (req, res) => {

  delete urlDatabase[req.params.id];
  res.redirect(`/urls`); // redirect
  
});

app.post("/urls/:id/", (req, res) => {

  urlDatabase[req.params.id]=req.body.newURL;
  res.redirect(`/urls`); // redirect
  
});

app.get("/u/:id", (req, res) => {
  const longURL =  urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
