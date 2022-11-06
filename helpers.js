function urlsForUser(id, database) {
  const urlByUserId = {};
  for (const key in database) {
    if (database[key].userID === id) {
      urlByUserId[key] = database[key];
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

function getUserByEmail(email, database) {
  for (const key in database) {
    if (database[key].email === email) {
      return database[key];
      
    }
  } return null;
}


module.exports = {getUserByEmail,generateRandomString, urlsForUser};