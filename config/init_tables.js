// establish Mysql Connection  
const mysql = require('mysql');  
const db = require('../models/db.js');
  
async function createUserTable() {  
  const createUserTableSQL = `CREATE TABLE IF NOT EXISTS USERS(
                              id int PRIMARY KEY AUTO_INCREMENT,
                              username varchar(30) NOT NULL UNIQUE,
                              email varchar(255) NOT NULL,
                              password varchar(80) NOT NULL,
                              photoUrl varchar(2083) )`;
  await db.getConnection(global.SQLpool, (err, connection) => {
    if (err) {
      console.log('fuck. Err:', err)
    } else {
      connection.query(createUserTableSQL, function(err, results, fields) {
        if (err) {
          console.log(err.message);
        } else {
          console.log('created user table')
        }
        connection.release()
      });
    }
  })
}

async function createFollowingTable() {
  const createFollowingTableSQL = `CREATE TABLE IF NOT EXISTS FOLLOWERS(
                                   followingUserId int,
                                   followedUserId int,
                                   PRIMARY KEY(followingUserId, followedUserId),
                                   FOREIGN KEY(followingUserId) REFERENCES USERS(id),
                                   FOREIGN KEY(followedUserId) REFERENCES USERS(id) )`;
  await db.getConnection(global.SQLpool, (err, connection) => {
    if (err) {
      console.log('fuck. Err:', err)
    } else {
      connection.query(createFollowingTableSQL, function(err, results, fields) {
        if (err) {
          console.log(err.message);
        } else {
          console.log('created following table')
        }
        connection.release()
      });
    }
  })
}

module.exports.initTables = async function() {
  await createUserTable()
  await createFollowingTable()
}
