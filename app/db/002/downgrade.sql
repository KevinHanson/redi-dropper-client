
USE RediDropper;

DELETE FROM Version where verID = '002';

DROP VIEW  IF EXISTS UserProjectRoleView;
DROP TABLE IF EXISTS UserAuth;
DROP TABLE IF EXISTS ProjectUserRole;
DROP TABLE IF EXISTS Project;
DROP TABLE IF EXISTS Role;
DROP TABLE IF EXISTS User;
