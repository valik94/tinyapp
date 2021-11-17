const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    //console.log(user);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
    // Write your assert statement here
  });
  it('should return undefined with an invalid email', function(){
    const user = getUserByEmail("val@example.com", testUsers) 
    assert.equal(user, undefined); //null and undefined here are equal
  }); 
});
