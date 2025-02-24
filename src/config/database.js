const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, { 
    host: "localhost",
    dialect: "mysql",
});

const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("-----------------");
    } catch (error) {
        console.error("Database connection error:", error);
    }
};

module.exports = connectDatabase;
