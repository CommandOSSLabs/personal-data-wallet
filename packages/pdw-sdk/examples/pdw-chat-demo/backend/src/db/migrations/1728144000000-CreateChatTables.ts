import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateChatTables1728144000000 implements MigrationInterface {
  name = 'CreateChatTables1728144000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'chat_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'user_address',
            type: 'varchar',
            length: '128',
            isNullable: false,
          },
          {
            name: 'archived',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        indices: [
          {
            name: 'IDX_chat_sessions_user_address',
            columnNames: ['user_address'],
          },
        ],
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'chat_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'role',
            type: 'varchar',
            length: '16',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'session_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_chat_messages_session',
            columnNames: ['session_id'],
            referencedTableName: 'chat_sessions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_chat_messages_session_id_created_at',
            columnNames: ['session_id', 'created_at'],
          },
        ],
      })
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chat_messages');
    await queryRunner.dropTable('chat_sessions');
  }
}
