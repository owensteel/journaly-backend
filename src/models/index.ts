// src/models/index.ts
import sequelize from '../db';
import User from './user';

const initDb = async () => {
    await sequelize.authenticate();
    await sequelize.sync();
};

export { sequelize, User, initDb };
