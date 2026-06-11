const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2')

// Pool ÚNICO compartilhado por todas as instâncias de Database (singleton).
// Evita criar um pool novo a cada `new Database()`, o que esgotava as conexões do banco.
const pool = mysql.createPool({
    host: process.env.DB_HOST, //endereço do nosso banco de dados na nuvem
    database: process.env.DB_DATABASE, //a database de cada um de vocês possui a nomenclatura PFS2_(RA)
    user: process.env.DB_USER, // usuario e senha de cada um de vocês é o RA
    password: process.env.DB_PASSWORD, // usuario e senha de cada um de vocês é o RA
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

    // Transações
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

    // Comandos usando uma conexão específica de transação
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


