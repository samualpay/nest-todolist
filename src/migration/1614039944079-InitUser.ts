import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUser1614039944079 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    //RUN
    await queryRunner.query(
      "Insert Into `user` (`account`,`password`) values('admin','admin')",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //REVERT
    await queryRunner.query("Delete from `user` Where `account` = 'admin'");
  }
}
