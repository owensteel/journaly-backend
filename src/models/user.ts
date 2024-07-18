// src/models/user.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

interface UserAttributes {
    id: number;
    google_id: string;
    name: string;
    email: string;
    picture?: string;
    refresh_token?: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> { }

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public google_id!: string;
    public name!: string;
    public email!: string;
    public picture?: string;
    public refresh_token?: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        google_id: {
            type: DataTypes.STRING,
            allowNull: false,
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
        },
        refresh_token: {
            type: DataTypes.TEXT,
        },
    },
    {
        sequelize,
        tableName: 'users',
    }
);

export default User;
