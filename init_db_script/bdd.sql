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

CREATE TABLE LocalizationData(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    localizationId INT(5) NOT NULL,
    inhabitantsNumber FLOAT(10) NOT NULL,
    vaccinationRate FLOAT(10) NOT NULL,
    date Date,
    FOREIGN KEY (localizationId) REFERENCES Localization(id)
);

CREATE TABLE Language(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    lang varchar(5) NOT NULL
);

CREATE TABLE ReportCase(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    totalConfirmed INT(10) DEFAULT 0 NOT NULL,
    totalDeath INT(10) DEFAULT 0 NOT NULL,
    totalActive INT(10) DEFAULT 0 NOT NULL,
    localizationId INT(5) NOT NULL,
    diseaseId INT(5) NOT NULL,
    date DATE,
    FOREIGN KEY (localizationId) REFERENCES Localization(id),
    FOREIGN KEY (diseaseId) REFERENCES Disease(id)
);

CREATE TABLE Role(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    roleName VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE User(
    id INT(5) AUTO_INCREMENT PRIMARY KEY,
    username varbinary(50) UNIQUE NOT NULL,
    password VARCHAR(500) NOT NULL,
    roleId INT(5) NOT NULL,
    localizationId INT(5),
    languageId INT(5) NOT NULL,
    FOREIGN KEY (roleId) REFERENCES Role(id),
    FOREIGN KEY (localizationId) REFERENCES Localization(id),
    FOREIGN KEY (languageId) REFERENCES Language(id)
);

INSERT INTO Language(lang) VALUES('en');
INSERT INTO Language(lang) VALUES('fr');
INSERT INTO Language(lang) VALUES('it');
INSERT INTO Language(lang) VALUES('de');
INSERT INTO Language(lang) VALUES('es');

INSERT INTO Role(roleName) VALUES('superadmin');
INSERT INTO Role(roleName) VALUES('admin');
INSERT INTO Role(roleName) VALUES('user');

INSERT INTO User(username, password, roleId, localizationId, languageId) VALUES("97de265f91ce69e70fdb551a61fb8a09", sha2('admin',256), 1,1,1);

-- Creation of composite indexes to make queries on report cases easier
CREATE INDEX idx_reportcase_localization_date ON ReportCase (localizationId, date);
CREATE INDEX idx_localizationdata_localization_date ON LocalizationData (localizationId, date);

DROP DATABASE IF EXISTS mspr_database_archive;
CREATE DATABASE mspr_database_archive;

GRANT ALL PRIVILEGES ON mspr_database_archive.* TO 'mspr_user'@'%';

USE mspr_database_archive;

CREATE TABLE millions_population_country (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(255),
    year_2018 DECIMAL(10, 3),
    year_2019 DECIMAL(10, 3),
    year_2020 DECIMAL(10, 3),
    year_2021 DECIMAL(10, 3),
    year_2022 DECIMAL(10, 3),
    year_2023 DECIMAL(10, 3)
);

CREATE TABLE countries_and_continents (
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    country VARCHAR(255),
    continent VARCHAR(255)
);

CREATE TABLE owid_monkeypox_data(
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    location varchar(255),
    iso_code varchar(255),
    date date,
    total_cases int(255),
    total_deaths int(255),
    new_cases int(255),
    new_deaths int(255),
    new_cases_smoothed decimal(50,5),
    new_deaths_smoothed decimal(50,5),
    new_cases_per_million decimal(50,5),
    total_cases_per_million decimal(50,5),
    new_cases_smoothed_per_million decimal(50,5),
    new_deaths_per_million decimal(50,5),
    total_deaths_per_million decimal(50,5),
    new_deaths_smoothed_per_million decimal(50,5)
);

CREATE TABLE vaccinations(
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    location varchar(255),
    iso_code varchar(255),
    date date,
    total_vaccinations BIGINT,
    people_vaccinated BIGINT,
    people_fully_vaccinated BIGINT,
    total_boosters BIGINT,
    daily_vaccinations_raw BIGINT,
    daily_vaccinations BIGINT,
    total_vaccinations_per_hundred decimal(50,5),
    people_vaccinated_per_hundred decimal(50,5),
    people_fully_vaccinated_per_hundred decimal(50,5),
    total_boosters_per_hundred  decimal(50,5),
    daily_vaccinations_per_million decimal(50,5),
    daily_people_vaccinated BIGINT,
    daily_people_vaccinated_per_hundred decimal(50,5)
);

CREATE TABLE worldometer_coronavirus_daily_data(
    id INT(10) AUTO_INCREMENT PRIMARY KEY,
    date date,
    country varchar(255),
    cumulative_total_cases int(255),
    daily_new_cases int(255),
    active_cases int(255),
    cumulative_total_deaths int(255),
    daily_new_deaths int(255)
);
