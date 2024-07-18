// User.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

class User extends Model {
    public id!: number;
    public google_id!: string;
    public name!: string;
    public email!: string;
    public picture!: string;
    public refresh_token!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        google_id: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        picture: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        refresh_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'user',
        tableName: 'users', // Ensure this matches your actual table name
        timestamps: true, // Sequelize will manage createdAt and updatedAt
        createdAt: 'created_at', // Optional: Customize the column names
        updatedAt: 'updated_at',
    }
);

export default User;
