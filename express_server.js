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

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: '$2a$10$ZfXjLZyDczPNZXTXo3sKiOoEEovi97dLaIxpUTeNRusUEXvIJCSEW',
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: '$2a$10$FTYU91tjSkuvx8c/ztrgvuN/pz.v9d1Ruazx2fhB1bOgUJduQSyba',
  },
  TwM7fR:{
    id: 'TwM7fR',
    email: 'ivesita.maria@gmail.com',
    password: '$2a$10$3oqVEWSW0HoSHRTzMChvXOesS96zQbK5XXkzRAH0H3VqGEujHYOy6'},
};


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

///////////////////////////////ROUTES//////////////////////////////////////////

app.get("/", (req, res) => {
  const obj = users[req.session.user_id];//get info from cookie
    if (obj !== undefined) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  const obj = users[req.session.user_id];
  if (obj === undefined) {
    const templateVars = { urls: urlDatabase, obj };
    res.render("register", templateVars);
  } else {
    res.redirect("/urls");
  }
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const obj = users[req.session.user_id];
  if (obj === undefined) {
    res.send("PLEASE LOG IN FIRST");
  } else {
    const templateVars = { urls: helpers.urlsForUser(obj.id, urlDatabase),obj};
    res.render("urls_index", templateVars);
  }
    
});

app.get("/urls/new", (req, res) => {
  const obj = users[req.session.user_id];
  if (obj === undefined) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase,obj};
    res.render("urls_new",templateVars);
  }
  
});

app.get("/urls/:id", (req, res) => {
  const obj = users[req.session.user_id];
  if (obj === undefined) {
    res.send("Please log in");
  } else {
    const shortURL = req.params.id;
    const arrKeys = Object.keys(urlDatabase);
    if (!arrKeys.includes(shortURL)) {
      res.send("That short url doenst exist");
    } else {
        
      if (obj.id !== urlDatabase[shortURL].userID) {
        res.send("You dont own that url");
      } else {
        const templateVars = { id:shortURL,obj,longURL: urlDatabase[shortURL].longURL};
        res.render("urls_show", templateVars);
      }
    }
  }

});



app.get("/login", (req, res) => {
  const obj = users[req.session.user_id];
  console.log("OBJ", obj);
  if (obj === undefined) {
    const templateVars = { urls: urlDatabase, obj};
    res.render("login", templateVars);

  } else {
    console.log("OBJ", obj);
    res.redirect("/urls");
  }
  
});



app.get("/u/:id", (req, res) => {
  const shortURLID = req.params.id;
  if (urlDatabase[shortURLID] === undefined) {
    res.send("That short URL does not exist");
  } else {
    const URL =  urlDatabase[shortURLID].longURL;
    res.redirect(URL);
    
  }
  
});

app.post("/urls", (req, res) => {//create new url
  const obj = users[req.session.user_id];
  if (obj === undefined) {
    res.send("Please login first");
  } else {
    const newlongURL = req.body.longURL;
    const randomString = helpers.generateRandomString();//create short url 
    const newObj = {longURL: newlongURL, userID: obj.id};
    urlDatabase[randomString] = newObj;//add to database new url
    res.send(res.redirect(`/urls/${randomString}`)); 
  
  }
});


app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = helpers.getUserByEmail(email,users);//look up user 

  if (user === null || !bcrypt.compareSync(req.body.password, user.password)) {
    res.send("403");//check user exists and password match
  } else {
    req.session.user_id = user.id;
    res.redirect("/login"); // redirect
  }
  
});



app.post('/sign-out', (req, res) => {
  req.session = null;// cookie is deleted
  res.redirect('/login');
});

app.post("/urls/:id/delete", (req, res) => {//delete url
  const obj = users[req.session.user_id];
  if (obj === undefined) {
    res.send("Please log in");//error message if the user is not logged in
  } else {
    const arrKeys = Object.keys(urlDatabase);//get all the short urls
    const idURL = req.params.id;//short url to delete
    if (!arrKeys.includes(idURL)) {
      res.send("That short url doenst exist");// msg if urlId does not exist
    } else {
       if (obj.id !== urlDatabase[idURL].userID) {//check if user owns url
        res.send("You dont own that URL"); 
      } else {
        delete urlDatabase[idURL];
        res.redirect(`/urls`); // redirect
      }
    }
  }
  
});

app.post("/urls/:id/", (req, res) => {//edit with new long URL
  const obj = users[req.session.user_id];
  const idURL = req.params.id;//short url to show
  if (obj === undefined) {
    res.send("Please log in");
  } else {
    const arrKeys = Object.keys(urlDatabase);//all the short urls
    if (!arrKeys.includes(idURL)) {
      res.send("That short url doen not exist");
    } else {
      urlDatabase[idURL].longURL = req.body.newURL;//update new long url
      res.redirect(`/urls`);
    }
  
  }
  
});


app.post("/register", (req, res) => {//create new user
  
  if (req.body.email === "" ||//make sure email and password is filled out
    req.body.password === "" ||
    helpers.getUserByEmail(req.body.email, users) !== null) {//and the email does not already exists
    res.send("404");
  } else {
    const idrandom = helpers.generateRandomString();
    users[idrandom] = {//create new user in database
      id: idrandom,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10) };//encrypt password
     
    req.session.user_id = idrandom;//create cookie
    res.redirect(`/urls`);
  }
  
});