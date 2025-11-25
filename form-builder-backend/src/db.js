const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao adquirir cliente PostgreSQL', err.stack);
  }
  console.log('Conexão com PostgreSQL estabelecida com sucesso!');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};