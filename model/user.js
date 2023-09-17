const { pool } = require("../database/db");
const bcrypt = require("bcrypt");

const checkIfUsernameExists = async (username) => {
  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return users.length > 0;
  } catch (error) {
    console.error("Error en checkIfUsernameExists:", error);
    throw error; // O manejar el error de alguna otra manera
  }
};

const createUser = async (username, password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);
  } catch (error) {
    console.error("Error en createUser:", error);
    throw error; // O manejar el error de alguna otra manera
  }
};

const getUserByUsername = async (username) => {
  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return users;
  } catch (error) {
    console.error("Error en getUser:", error);
    throw error; // O manejar el error de alguna otra manera
  }
};

const comparePasswords = (password, hashedPassword) => {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error("Error en comparePasswords:", error);
    throw error; // O manejar el error de alguna otra manera
  }
};

module.exports = {
  checkIfUsernameExists,
  createUser,
  getUserByUsername,
  comparePasswords,
};
