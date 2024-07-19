// src/models/goal.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

class Goal extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public user_id!: number;
    public end_date!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Goal.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'goal',
        tableName: 'goals', // Ensure this matches your actual table name
        timestamps: true, // Sequelize will manage createdAt and updatedAt
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export { Goal };
