module.exports = {
    port: process.env.PORT || 8080,
    db: {
        database: process.env.DB_NAME || 'clevrbooks',
        user: process.env.DB_USER || 'clevrcode',
        password: process.env.DB_PASSWORD || '12345678',
        options: {
            dialect: process.env.DIALECT || 'sqlite',
            host: process.env.HOST || 'localhost',
            storage: './clevrbooks.sqlite'
        }
    },
    JWT: {
        key: 'supersecretkey',
        expiresIn: 60 * 60 * 24 * 7   
    }
}
