// establish Mysql Connection  
const mysql = require('mysql')
const db = require('../models/db.js')
const util = require('util')
const bluebird = require('bluebird')
  
async function createUserTable() {  
  const createUserTableSQL = `CREATE TABLE IF NOT EXISTS USERS(
                              id int PRIMARY KEY AUTO_INCREMENT,
                              username varchar(30) NOT NULL UNIQUE,
                              email varchar(255) NOT NULL,
                              password varchar(80) NOT NULL,
                              photoUrl varchar(2083) )`;
  try {
    connection = await db.getConnection()
    resultObj = await db.query(connection, createUserTableSQL)
    console.log('created user table')
  } catch (err) {
    console.log(err.message)
  }
}

async function createFollowingTable() {
  const createFollowingTableQuery = `CREATE TABLE IF NOT EXISTS FOLLOWERS(
                                     followingUserId int,
                                     followedUserId int,
                                     PRIMARY KEY(followingUserId, followedUserId),
                                     FOREIGN KEY(followingUserId) REFERENCES USERS(id),
                                     FOREIGN KEY(followedUserId) REFERENCES USERS(id) )`;
  try {
    connection = await db.getConnection()
    resultObj = await db.query(connection, createFollowingTableQuery)
    console.log('created following table')
  } catch (err) {
    console.log(err.message)
  }
}

module.exports.initTables = async function() {
  await createUserTable()
  await createFollowingTable()
}
