/**
 * Data migration script from MySQL to PostgreSQL
 * Project : roundmatch
 * 
 * This script helps migrate data from MySQL to PostgreSQL
 * Usage: node src/migrations/migrate-mysql-to-pg.js
 **/

const mysql = require('mysql2/promise')
const { Client } = require('pg')
const dbConfig = require('../config/db.config')

// MySQL connection config (from old config)
const mysqlConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'roundmatch',
    password: process.env.MYSQL_PASSWORD || 'Weilan123!@#',
    database: process.env.MYSQL_DB || 'roundmatch'
}

// PostgreSQL connection config
const pgConfig = {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
}

async function migrateTable(mysqlConn, pgClient, tableName) {
    console.log(`Migrating table: ${tableName}`)
    
    try {
        // Fetch data from MySQL
        const [rows] = await mysqlConn.execute(`SELECT * FROM ${tableName}`)
        console.log(`  Found ${rows.length} rows`)
        
        if (rows.length === 0) {
            console.log(`  No data to migrate`)
            return
        }
        
        // Get column names
        const columns = Object.keys(rows[0])
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
        const columnNames = columns.join(', ')
        
        // Insert into PostgreSQL
        const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`
        
        let inserted = 0
        for (const row of rows) {
            const values = columns.map(col => {
                let value = row[col]
                // Handle NULL values
                if (value === null || value === undefined) {
                    return null
                }
                // Handle dates
                if (value instanceof Date) {
                    return value.toISOString()
                }
                // Handle boolean (MySQL uses TINYINT)
                if (typeof value === 'number' && (value === 0 || value === 1) && 
                    (col === 'delete' || col === 'enable' || col === 'vip' || col === 'public')) {
                    return value === 1
                }
                return value
            })
            
            try {
                await pgClient.query(insertQuery, values)
                inserted++
            } catch (err) {
                console.error(`  Error inserting row:`, err.message)
            }
        }
        
        console.log(`  Inserted ${inserted} rows`)
    } catch (err) {
        console.error(`  Error migrating ${tableName}:`, err.message)
    }
}

async function migrate() {
    let mysqlConn = null
    let pgClient = null
    
    try {
        console.log('Connecting to MySQL...')
        mysqlConn = await mysql.createConnection(mysqlConfig)
        console.log('MySQL connected')
        
        console.log('Connecting to PostgreSQL...')
        pgClient = new Client(pgConfig)
        await pgClient.connect()
        console.log('PostgreSQL connected')
        
        // List of tables to migrate
        const tables = [
            'clubs',
            'users',
            'players',
            'matches',
            'games',
            'system',
            'notices',
            'userconfig'
        ]
        
        // Migrate each table
        for (const table of tables) {
            await migrateTable(mysqlConn, pgClient, table)
        }
        
        console.log('Migration completed!')
    } catch (err) {
        console.error('Migration error:', err)
    } finally {
        if (mysqlConn) {
            await mysqlConn.end()
        }
        if (pgClient) {
            await pgClient.end()
        }
    }
}

// Run migration if executed directly
if (require.main === module) {
    migrate()
}

module.exports = { migrate }

