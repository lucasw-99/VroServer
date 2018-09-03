// establish Mysql Connection  
const mysql = require('mysql')
const db = require('../models/db.js')
const util = require('util')
  
async function createUserTable() {  
  const createUserTableSQL = `CREATE TABLE IF NOT EXISTS USERS(
                              id int PRIMARY KEY AUTO_INCREMENT,
                              username varchar(30) NOT NULL UNIQUE,
                              email varchar(255) NOT NULL,
                              password varchar(80) NOT NULL,
                              photoUrl varchar(2083) )`
  try {
    connection = await db.getConnection()
    await db.query(connection, createUserTableSQL)
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
                                     FOREIGN KEY(followedUserId) REFERENCES USERS(id) )`
  try {
    connection = await db.getConnection()
    await db.query(connection, createFollowingTableQuery)
  } catch (err) {
    console.log(err.message)
  }
}

async function createEventsTable() {
  const createEventsTableQuery = `CREATE TABLE IF NOT EXISTS EVENTS(
                                  id int PRIMARY KEY AUTO_INCREMENT,
                                  hostId int NOT NULL,
                                  description varchar(140),
                                  address varchar(50) NOT NULL,
                                  latitude DECIMAL NOT NULL,
                                  longitude DECIMAL NOT NULL,
                                  eventImageUrl varchar(2083),
                                  getStreamTime VARCHAR(27) NOT NULL,
                                  attendingCount int DEFAULT 0,
                                  likeCount int DEFAULT 0,
                                  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                                  FOREIGN KEY(hostId) REFERENCES USERS(id) )`
  try {
    connection = await db.getConnection()
    await db.query(connection, createEventsTableQuery)
  } catch (err) {
    console.log('Creating events table failed with err:', err.message)
  }
}

async function createLikesTable() {
  const createLikesTableQuery = `CREATE TABLE IF NOT EXISTS LIKES(
                                 likingUserId int,
                                 eventId int,
                                 PRIMARY KEY(likingUserId, eventId),
                                 FOREIGN KEY(likingUserId) REFERENCES USERS(id),
                                 FOREIGN KEY(eventId) REFERENCES EVENTS(id) )`
  try {
    connection = await db.getConnection()
    await db.query(connection, createLikesTableQuery)
  } catch (err) {
    console.log(err.message)
  }
}

module.exports.initTables = async function() {
  await createUserTable()
  await createFollowingTable()
  await createEventsTable()
  await createLikesTable()
}
