const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const chalk = require('chalk');
const figlet = require('figlet');
var colors = require('colors');

const connection = mysql.createConnection({
  host: "localhost",

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "employeeDataBase",
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  console.log(
    chalk.green(
      figlet.textSync('Employee Tracker', { font: 'big', horizontalLayout: 'full' })
    )
  );
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
          "view Employee By Manager",
          "Remove an Employee",
          "Add Department",
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

        case "view Employee By Manager":
          viewEmpByManager();
          break;

        case "Remove an Employee":
          delEmployee();
          break;

        case "Add Department":
          addDepartment();
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
  console.log("Inserting a new employee \n" .blue);
  let roles = [];
    connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      roles.push({
        name: res[i].title,
        value: res[i].id
      });
    }
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
        choices: roles,
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
          console.log("Employee  added!\n " .yellow);
          init();
        }
      );
    });
  });
}

// Remmoving an employee
function delEmployee() {
  let employees = [];
  connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee', function(err, response){
    for(let i=0; i<response.length; i++){
      employees.push({name: response[i].name})
    }
  inquirer.prompt([
    {
      type: "list",
      name: "empName",
      message: "What is the name of the employee you woul like to remove?",
      choices: employees
    }
  ]).then(function(answer){
    let toBeRemovedEmployeeId;
    connection.query(`SELECT id FROM employee WHERE concat(first_name, " ", last_name) = '${answer.empName}'`,function (err, result ){
      if(err) throw err;
     toBeRemovedEmployeeId = JSON.parse(JSON.stringify(result[0])).id;
     connection.query("DELETE FROM employee WHERE id=?", toBeRemovedEmployeeId);
     console.log(`Employee ${answer.empName} was removed`.red);
     init();
    });
  })
  });
  
}
function viewEmpByManager() {
  let managers = [];
  connection.query("SELECT * FROM employee", function(err,res){
    for(let i=0; i<res.length; i++){
      managers.push({name: res[i].manager_id})
    }
    inquirer.prompt([
      {
        type: "list",
        name: "managerID",
        message: "Choose the manager id to view employess",
        choices : managers
      }
    ]).then(function(answers){
      connection.query(`SELECT * FROM employee WHERE manager_id = '${answers.managerID}'`, function(err, res){
        if(err) throw err;
        console.table(`Employess with Manager id:'${answers.managerID}'`.blue, res);
        init();
      });
    })
  })

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

function updateEmployeeRole() {
  let employees = [];
    connection.query("SELECT * FROM employee", function (err, empres) {
    if (err) throw err;
    for (let i = 0; i < empres.length; i++) {
      employees.push({
        name: empres[i].first_name + " " + empres[i].last_name
      });
    }
    let roles = [];
    connection.query("SELECT * FROM role", function (err, roleres) {
    if (err) throw err;
    for (let i = 0; i < roleres.length; i++) {
      roles.push({
        name:  roleres[i].title,
        Id: roleres[i].id
      });
    }
    inquirer.prompt([
      {
        name: "employee",
        type: "list",
        message: "choose the employee to update their role",
        choices : employees,
      },
      {
        name: "role",
        type: "list",
        message: "Choose the role:",
        choices: roles
      }
    ]).then(function(answers){
      let roleId;
      connection.query(`SELECT id FROM role WHERE title = '${answers.role}'`,function (err, response){
        if(err) throw err;
        roleId = JSON.parse(JSON.stringify(response[0])).id
      let empId;
      connection.query(`SELECT id FROM employee WHERE concat(first_name, " ", last_name) = '${answers.employee}'`,function (err, result ){
        if(err) throw err;
        empId = JSON.parse(JSON.stringify(result[0])).id;
        connection.query('UPDATE employee SET role_id=? WHERE id= ?', [roleId, empId]);
        console.log(`${answers.employee} Role updated` .yellow);
        init();
        }) 
     }) 
     });
  })
  })
}
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
          console.table("Department Added!" .blue);
          init();
        }
      );
    });
}

