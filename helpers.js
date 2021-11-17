const getUserByEmail= function(emailUser, users){
  for (let user in users){
    if (users[user].email === emailUser){
      return users[user];   
    }
  }
  return null;
}

module.exports = {getUserByEmail};