DROP DATABASE IF EXISTS mspr_database;
CREATE DATABASE mspr_database;

USE mspr_database;

DROP USER IF EXISTS mspr_user;
CREATE USER 'mspr_user'@'%' IDENTIFIED BY 'mspr_user';
GRANT ALL PRIVILEGES ON mspr_database.* TO 'mspr_user'@'%';

CREATE TABLE Disease(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Localization(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(50) UNIQUE NOT NULL,
    continent varchar(20) NOT NULL
);

CREATE TABLE ReportCase(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    totalConfirmed INT(10) NOT NULL,
    totalRecoveries INT(10) NOT NULL,
    totalDeath INT(10) NOT NULL,
    totalActive INT(10) NOT NULL,
    localizationId INT(5) NOT NULL,
    diseaseId INT(5) NOT NULL,
    date DATE,
    FOREIGN KEY (localizationId) REFERENCES Localization(id),
    FOREIGN KEY (diseaseId) REFERENCES Disease(id)
);