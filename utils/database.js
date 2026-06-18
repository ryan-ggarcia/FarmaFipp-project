const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2')

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    idleTimeout: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 20
});

class Database {

    #conexao;

    get conexao() { return this.#conexao; } set conexao(conexao) { this.#conexao = conexao; }

    constructor() {
        this.#conexao = pool;
    }

    ExecutaComando(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function (res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error)
                    rej(error);
                else
                    res(results);
            });
        })
    }

    ExecutaComandoNonQuery(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function (res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error)
                    rej(error);
                else
                    res(results.affectedRows > 0);
            });
        })
    }

    ExecutaComandoLastInserted(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function (res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error)
                    rej(error);
                else
                    res(results.insertId);
            });
        })
    }

    async BeginTransaction() {
        return new Promise((resolve, reject) => {
            this.#conexao.getConnection((err, connection) => {
                if (err) return reject(err);
                connection.beginTransaction(err => {
                    if (err) {
                        connection.release();
                        return reject(err);
                    }
                    resolve(connection);
                });
            });
        });
    }

    async Commit(connection) {
        return new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) {
                    return connection.rollback(() => {
                        connection.release();
                        reject(err);
                    });
                }
                connection.release();
                resolve();
            });
        });
    }

    async Rollback(connection) {
        return new Promise((resolve, reject) => {
            connection.rollback(() => {
                connection.release();
                resolve();
            });
        });
    }

    async ExecutaComandoTransacao(sql, valores, connection) {
        return new Promise((resolve, reject) => {
            connection.query(sql, valores, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
    }

    async ExecutaComandoNonQueryTransacao(sql, valores, connection) {
        return new Promise((resolve, reject) => {
            connection.query(sql, valores, (error, results) => {
                if (error) reject(error);
                else resolve(results.affectedRows > 0);
            });
        });
    }

    async ExecutaComandoLastInsertedTransacao(sql, valores, connection) {
        return new Promise((resolve, reject) => {
            connection.query(sql, valores, (error, results) => {
                if (error) reject(error);
                else resolve(results.insertId);
            });
        });
    }
}
module.exports = Database;


