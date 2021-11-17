const getUserByEmail= function(emailUser, users){
  for (let user in users){
    if (users[user].email === emailUser){
      return users[user];   
    }
  }
  return null;
}

const checkUser = function (users, emailUser, emailPassword){
  for (let user in users){
    if ((users[user].email === emailUser) && (users[user].password === emailPassword)) {
      return true; //user already exists
    }
  }
  return false; //user doesnt exist in users object
}

const getUserID = function (users, emailUser){
  for (let user in users){
    //console.log(email);
    if (users[user].email=== emailUser){
      //console.log(users[user].id)
      return users[user].id;
    }
  }
}

const registerUser = function(users, emailUser){
  for (let user in users){
    if (users[user].email === emailUser){
      return true;   
    }
  }
  return false;
}


//logged in user urls
const urlsUser = function (userid, urlDatabase){
  const newObjectDatabase={};
  for (let obj in urlDatabase){
    console.log(obj);
    if (urlDatabase[obj].userID === userid){
      newObjectDatabase[obj] = urlDatabase[obj];
    }
  }
  return newObjectDatabase;
}

const userOwner = function (userid, shortURL, urlDatabase){
  if (urlDatabase[shortURL].userID === userid){
    return true;
  }
  else {
    return false;
  }
}

module.exports = {getUserByEmail,checkUser, getUserID, registerUser, urlsUser, userOwner};