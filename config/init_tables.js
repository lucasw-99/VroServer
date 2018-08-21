// establish Mysql Connection  
const mysql = require('mysql');  
const db = require('../models/db.js');
  
module.exports.createUserTable = function() {  
  const createUserTable = `CREATE TABLE IF NOT EXISTS USERS(
                            id int PRIMARY KEY AUTO_INCREMENT,
                            email varchar(255) NOT NULL,
                            password varchar(40) NOT NULL,
                            photoUrl varchar(2083) );`
  db.getConnection(global.SQLpool, (err, connection) => {
    if (err) {
      console.log('fuck. Err:', err)
    } else {
      connection.query(createUserTable, function(err, results, fields) {
        if (err) {
          console.log(err.message);
        }
      });
    }
  })
}
