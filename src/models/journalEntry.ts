// src/models/journalEntry.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db';

class JournalEntry extends Model {
    public id!: number;
    public text!: string;
    public user_id!: number;
    public goal_id!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

JournalEntry.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        goal_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'journal_entry',
        tableName: 'journal_entries',
        timestamps: true, // Sequelize will manage createdAt and updatedAt
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

export { JournalEntry };
