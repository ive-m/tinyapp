
////////////HELPER FUNCTIONS///////////////////////////////////////

function urlsForUser(id, database) {//get all urls for that user id
  const urlByUserId = {};
  for (const key in database) {//look for URLs that belong to the user
    if (database[key].userID === id) {
      urlByUserId[key] = database[key];//add them to the URL by user object
    }
  }
  return urlByUserId;//return the object with all the URLs created by the user
}
  

function generateRandomString() {//generate a random string of 6 characters
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 6; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}


function getUserByEmail(email, database) {//look up user with that email in database
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];//if found return user
    }
  }
  return null;//if not found return null
}

//////////////////////////////////////DATABASE//////////////////////////////

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
  TwM7fR: {
    longURL: "https://www.tsn.ca",
    userID: "TwM7fR",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

///////////////////////////////////////////////////////////////////////////

module.exports = {users,urlDatabase,getUserByEmail,generateRandomString, urlsForUser};