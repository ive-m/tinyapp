const express = require("express");
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
//app.use(cookieParser());
app.set('trust proxy', 1) // trust first proxy
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

function urlsForUser(id) {
  const urlByUserId = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      urlByUserId[key] = urlDatabase[key];
    }
  } return urlByUserId;
}
  

function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function lookupUser(email) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key];
      
    }
  } return null;
}


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

////////////////ROUTES/////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  const obj = users[req.session.user_id];
  console.log(obj);
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
  console.log(obj);
  if (obj === undefined) {
    res.send("PLEASE LOG IN FIRST");
  } else {
    const templateVars = { urls: urlsForUser(obj.id),obj};
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
    const urlUserId = req.params.id;
    const arrKeys = Object.keys(urlDatabase);
    if (!arrKeys.includes(urlUserId)) {
      res.send("That short url doenst exist");
    } else {
        
      if (obj.id !== urlDatabase[urlUserId].userID) {
        res.send("You dont own that url");
      } else {
        const templateVars = { id:urlUserId,obj,longURL: urlDatabase[urlUserId].longURL};
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
  const i = req.params.id;
  if (urlDatabase[i] === undefined) {
    res.send("Id doesnt exist");
  } else {
    const newlongURL =  urlDatabase[i].longURL;
    res.redirect(newlongURL);
  }
  
});

app.post("/urls", (req, res) => {
  const obj = users[req.session.user_id];
  if (obj === undefined) {
    res.send("Please login first");
  } else {
    const newlongURL = req.body.longURL;
    const randomString = generateRandomString();
    const newObj = {longURL: newlongURL, userID: obj.id};
    urlDatabase[randomString] = newObj;//add to database
    res.send(res.redirect(`/urls/${randomString}`)); // redirect}
  
  
  }
});


app.post("/login", (req, res) => {
  const e = req.body.email;
  const u = lookupUser(e);

  if (u === null || !bcrypt.compareSync(req.body.password, u.password)) {
    res.send("403");
  } else {
    req.session.user_id=u.id;
    //res.cookie("user_id", u.id);
    res.redirect("/urls"); // redirect
  }
  
});



app.post('/sign-out', (req, res) => {
  req.session=null;
  res.redirect('/login');
});

app.post("/urls/:id/delete", (req, res) => {

  const obj = users[req.session.user_id];

  if (obj === undefined) {
    res.send("Please log in");//error message if the user is not logged in
  } else {
    const arrKeys = Object.keys(urlDatabase);
    const idURL = req.params.id;

    if (!arrKeys.includes(idURL)) {
      res.send("That short url doenst exist");// msg if urlId does not exist
    } else {
 
      if (obj.id !== urlDatabase[idURL].userID) {
        res.send("You dont own that URL"); //error message if the user does not own the URL
      } else {
        delete urlDatabase[idURL];
        res.redirect(`/urls`); // redirect
      }
    }

  }
  
});

app.post("/urls/:id/", (req, res) => {
  const obj = users[req.session.user_id];
  const idURL = req.params.id;
  if (obj === undefined) {
    res.send("Please log in");
  } else {
    const arrKeys = Object.keys(urlDatabase);
    if (!arrKeys.includes(idURL)) {
      res.send("That id doenst exist");
    } else {
      urlDatabase[idURL].longURL = req.body.newURL;
      res.redirect(`/urls`);
    }
  
  }
  
});


app.post("/register", (req, res) => {
  
  if (req.body.email === "" ||
    req.body.password === "" ||
    lookupUser(req.body.email) !== null) {
    res.send("404");
  } else {
  
    const idrandom = generateRandomString();
    users[idrandom] = {
      id: idrandom,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10) };

    console.log(users);
    req.session.user_id= idrandom;
    //res.cookie("user_id", idrandom);
 
    res.redirect(`/urls`);
  }
  
});