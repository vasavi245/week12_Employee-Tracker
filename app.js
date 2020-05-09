const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "employee_DB",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  init();
});

// starting with init function that prompts user 
function init() {
  inquirer
    .prompt([
      {
        name: "action",
        type: "list",
        message: "what would you like to do?",
        choices: [
          "Add Employee",
          "View All Employees",
          "Remove Employee",
          "Add Department",
          "Remove Role",
          "View All Departments",
          "Add Roles",
          "View all Roles",
          "Update Employee Role",
          "Exit",
        ],
      },
    ])
    .then(function (answer) {
      switch (answer.action) {
        case "Add Employee":
          addEmployee();
          break;

        case "View All Employees":
          viewAllEmployees();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Remove Role":
          delRole();
          break;

        case "View All Departments":
          viewAllDept();
          break;

        case "Add Roles":
          addRole();
          break;

        case "View all Roles":
          viewAllRoles();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Exit":
          connection.end();
          break;
      }
    });
}
// view all the employees
function viewAllEmployees() {
  connection.query(
    'SELECT e.id, e.first_name AS First_Name, e.last_name AS Last_Name, title AS Title, salary AS Salary, name AS Department, CONCAT(m.first_name, " ", m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id',
    function (err, res) {
      if (err) throw err;
      console.table("All Employees:", res);
      init();
    }
  );
}
// adding an employee
function addEmployee() {
  console.log("Inserting a new employee \n");
  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "First name of the employee?",
      },
      {
        type: "input",
        name: "last_name",
        message: "last name of the employee?",
      },
      {
        type: "list",
        name: "role_id",
        message: "What is the Employee role?",
        choices: [1, 2, 3, 4],
      },
      {
        type: "input",
        name: "manager_id",
        message: "who is their manager?",
      },
    ])
    .then(function (response) {
      connection.query(
        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?)",
        [
          [
            response.first_name.trim(),
            response.last_name.trim(),
            response.role_id,
            response.manager_id,
          ],
        ],
        function (err, res) {
          if (err) throw err;
          console.log("Employee  added!\n");
          init();
        }
      );
    });
}
// adding role
function addRole() {
  let departments = [];
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      res[i].first_name + " " + res[i].last_name;
      departments.push({
        name: res[i].name,
        value: res[i].id,
      });
    }
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "What role would you like to add?",
        },
        {
          type: "input",
          name: "salary",
          message: "what is the salary for the role?",
        },
        {
          type: "list",
          name: "department",
          message: "what department?",
          choices: departments,
        },
      ])
      .then(function (response) {
        console.log(response);
        connection.query(
          "INSERT INTO role SET?",
          {
            title: response.title,
            salary: response.salary,
            department_id: response.department,
          },
          function (err, res) {
            if (err) throw err;
            init();
          }
        );
      });
  });
}
// view all the roles of the employees
function viewAllRoles() {
  const query = "SELECT * FROM role";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table("All roles:", res);
    init();
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "deptname",
        message: "What department you would like to add?",
      },
    ])
    .then(function (res) {
      console.log(res);
      const query = connection.query(
        "INSERT INTO department SET ?",
        {
          name: res.deptname,
        },
        function (err, res) {
          connection.query("SELECT * FROM departments", function (err, res) {
            console.table(res);
            init();
          });
        }
      );
    });
}
// updating a role 

function viewAllDept() {
  const query = "SELECT * FROM department";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table("All Departments:", res);
    init();
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "deptName",
        message: "Which Department you would like to add?",
      },
    ])
    .then(function (response) {
      connection.query(
        "INSERT INTO department (name) VALUES (?)",
        [response.deptName],
        function (err, res) {
          if (err) throw err;
          console.table("Department Added!");
          init();
        }
      );
    });
}
