USE employeeDataBase;

CREATE TABLE department (
    id INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
    name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(9,2) NOT NULL,
    department_id INT NOT NULL
);

CREATE TABLE employee (
    id INT IDENTITY(1, 1) PRIMARY KEY NOT NULL,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT NULL
);
SELECT * FROM employee;
SELECT * FROM role;
SELECT * FROM department
