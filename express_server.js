const express = require("express");
const helpers = require("./helpers");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1); // trust first proxy
app.use(cookieSession({keys:["key1", "key2"]}));


///////////////////////////////ROUTES//////////////////////////////////////////


app.get("/", (req, res) => {
  const obj = helpers.users[req.session.user_id];//get info from cookie
  if (obj !== undefined) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  const obj = helpers.users[req.session.user_id];//get info from cookie
  if (obj === undefined) {
    const templateVars = { urls: helpers.urlDatabase, obj };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
  
});

app.get("/urls.json", (req, res) => {
  res.json(helpers.urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const obj = helpers.users[req.session.user_id];//get info from cookie
  if (obj === undefined) {
    res.send("PLEASE LOG IN FIRST");
  } else {
    const templateVars = { urls: helpers.urlsForUser(obj.id, helpers.urlDatabase),obj};
    res.render("urls_index", templateVars);
  }
    
});

app.get("/urls/new", (req, res) => {
  const obj = helpers.users[req.session.user_id];//get info from cookie
  if (obj === undefined) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: helpers.urlDatabase,obj};
    res.render("urls_new",templateVars);
  }
  
});

app.get("/urls/:id", (req, res) => {
  const obj = helpers.users[req.session.user_id];//get info from cookie
  if (obj === undefined) {
    res.send("PLEASE LOG IN FIRST");
  } else {
    const shortURL = req.params.id;
    const arrKeys = Object.keys(helpers.urlDatabase);//array of short URLs
    if (!arrKeys.includes(shortURL)) {
      res.send("THAT SHORT URL DOES NOT EXIST");
    } else {
      if (obj.id !== helpers.urlDatabase[shortURL].userID) {//user id doesnt match the url user id
        res.send("YOU DO NOT OWN THAT URL");
      } else {
        const templateVars = { id:shortURL,obj,longURL: helpers.urlDatabase[shortURL].longURL};
        res.render("urls_show", templateVars);
      }
    }
  }

});

app.get("/login", (req, res) => {
  const obj = helpers.users[req.session.user_id];//get info from cookie
  if (obj === undefined) {
    const templateVars = { urls: helpers.urlDatabase, obj};
    res.render("login", templateVars);

  } else {
    res.redirect("/urls");
  }

});

app.get("/u/:id", (req, res) => {
  const shortURLID = req.params.id;
  if (helpers.urlDatabase[shortURLID] === undefined) {
    res.send("THAT SHORT URL DOES NOT EXIST");
  } else {
    const URL =  helpers.urlDatabase[shortURLID].longURL;
    res.redirect(URL);
    
  }
  
});

app.post("/urls", (req, res) => {//create new url
  const obj = helpers.users[req.session.user_id];//get info from cookie
  if (obj === undefined) {
    res.send("PLEASE LOG IN FIRST");
  } else {
    const newlongURL = req.body.longURL;
    const randomString = helpers.generateRandomString();//create short url
    const newObj = {longURL: newlongURL, userID: obj.id};
    helpers.urlDatabase[randomString] = newObj;//add to database new url
    res.send(res.redirect(`/urls/${randomString}`));
  
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") { //inputs cannot be blank
    res.send("PLEASE ENTER EMAIL AND PASSWORD");
  } else {
    const user = helpers.getUserByEmail(email,helpers.users);//look up user
    if (user === null) {//check user exists
      res.send("USER DOES NOT EXIST");
    } else if (!bcrypt.compareSync(password, user.password)) {//check password match
      res.send("PASSWORD IS INCORRECT");
    } else {
      req.session.user_id = user.id;
      res.redirect("/login"); // redirect
    }
    
  }
  
});

app.post('/sign-out', (req, res) => {
  req.session = null;// cookie is deleted
  res.redirect('/login');
});

app.post("/urls/:id/delete", (req, res) => {//delete url
  const obj = helpers.users[req.session.user_id];
  if (obj === undefined) {
    res.send("PLEASE LOG IN");//error message if the user is not logged in
  } else {
    const arrKeys = Object.keys(helpers.urlDatabase);//get all the short urls
    const idURL = req.params.id;//short url to delete
    if (!arrKeys.includes(idURL)) {
      res.send("THAT SHORT URL DOES NOT EXIST");// msg if urlId does not exist
    } else {
      if (obj.id !== helpers.urlDatabase[idURL].userID) {//check if user owns url
        res.send("YOU DO NOT OWN THAT URL");
      } else {
        delete helpers.urlDatabase[idURL];
        res.redirect(`/urls`); // redirect
      }
    }
  }
  
});

app.post("/urls/:id/", (req, res) => {//edit with new long URL
  const obj = helpers.users[req.session.user_id];
  const idURL = req.params.id;//short url to show
  if (obj === undefined) {
    res.send("PLEASE LOG IN");
  } else {
    const arrKeys = Object.keys(helpers.urlDatabase);//all the short urls
    if (!arrKeys.includes(idURL)) {
      res.send("THAT SHORT URL DOES NOT EXIST");
    } else {
      helpers.urlDatabase[idURL].longURL = req.body.newURL;//update new long url
      res.redirect(`/urls`);
    }
  
  }
  
});

app.post("/register", (req, res) => {//create new user
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {//make sure email and password are filled out
    res.send("PLEASE ENTER EMAIL AND PASSWORD");
  }  else if (helpers.getUserByEmail(email, helpers.users) !== null) {//check email is not in database
    res.send("THAT EMAIL ALREADY EXISTS");
  }  else {
    const idrandom = helpers.generateRandomString();
    helpers.users[idrandom] = {//create new user in database
      id: idrandom,
      email: email,
      password: bcrypt.hashSync(password, 10) };//encrypt password
     
    req.session.user_id = idrandom;//create cookie
    res.redirect(`/urls`);
  }
  
});

//////////////////////////////LISTENER///////////////////////////////////

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});