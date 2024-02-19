const connection = require('../config/dd.config');


/*
* addUser - add users to database
* 
* Returns: user object
*/

const addUser = async (userObj) => {
    const { email, password, phone, userId, token, verified} = userObj;
    try {
      const [rows] = await connection.query(`
      INSERT INTO users
      (email, password, phone, userId, token, verified)
      VALUES (?, ?, ?, ?, ?, ?)
      `, [email, password, phone, userId, token, verified]);
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
};


/** 
* fetchUser - get user
* email: user's email
* Returns: user's object
*/

const getUser = async (email) => {
    try {
      const [rows] = await connection.query(`
      SELECT * FROM users
      WHERE email = ?`,
      [email]);
      return rows[0];
    } catch (error) {
      throw new Error(`error fetching products ${categoryId}`);
    }
};


module.exports = { addUser, getUser }