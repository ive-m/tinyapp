const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "d",
  },
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function lookupUser(email) {
  for (const key in users) {
    if (users[key].email===email) {
      return users[key];
      
    }
  }return null;
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const obj = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, obj };
  res.render("register", templateVars);
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const obj = users[req.cookies["user_id"]];
  
  const templateVars = { urls: urlDatabase,obj};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const obj = users[req.cookies["user_id"]];
  const templateVars = {obj};
  res.render("urls_new",templateVars);
});

app.get("/urls/:id", (req, res) => {
  const obj = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, obj, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});



app.get("/login", (req, res) => {
  
  const obj = undefined;
  const templateVars = { urls: urlDatabase, obj};
  res.render("login", templateVars);

});

app.get("/u/:id", (req, res) => {
  const longURL =  urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const randomString = generateRandomString();
  urlDatabase[randomString] = longURL;//add to database
  res.send(res.redirect(`/urls/${randomString}`)); // redirect
  
});


app.post("/login", (req, res) => {
  const e= req.body.email;
const u= lookupUser(e);
  if (u===null|| u.password!==req.body.password) {
    res.send("403");
  }else {
    res.cookie("user_id", u.id );
    res.redirect("/urls"); // redirect
  }
  
});

app.post('/sign-out', (req, res) => {
  res.clearCookie('user_id'); // Tell the browser to delete this cookie.
  res.redirect('/login');
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`); // redirect
  
});

app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id]=req.body.newURL;
  res.redirect(`/urls`);
  
});

app.post("/register", (req, res) => {
  
if (req.body.email===""|| 
    req.body.password===""||
    lookupUser(req.body.email)!==null){
  res.send("404")
}

else{
  
  const idrandom= generateRandomString();
  users[idrandom]={
    id: idrandom, 
    email: req.body.email, 
    password: req.body.password }

  console.log(users)
  res.cookie("user_id", idrandom);
 
  res.redirect(`/urls`); }
  
});