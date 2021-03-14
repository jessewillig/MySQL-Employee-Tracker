const inquirer = require("inquirer");
const mysql = require("mysql");
require("console.table");

// create connection
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Oakley123",
    database: "employee_db"
});

// connect
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    console.clear();
    init();
});

// initial choice
function init () {
    inquirer.prompt([
        {
            type: "list",
            name: "options",
            message: "What are you looking to do?",
            choices: ["ADD dept, employee or role", "VIEW all depts, roles, roles by dept, all employees, employees by manager or dept buggets", "UPDATE employee manager or employee role", "DELETE employee, role or dept", "QUIT"]
        }
    ]).then((response) => {
        switch (response.options) {
            case "ADD dept, employee or role":
                inquirer.prompt([
                    {
                        type: "list",
                        name: "add",
                        message: "What are you adding?",
                        choices: ["ADD dept", "ADD role", "ADD employee", "BACK"]
                    }
                ]).then((response) => {
                    switch (response.add) {
                        case "ADD employee":
                            addEmp();
                            break;
                        case "ADD role":
                            addRole();
                            break;
                        case "ADD dept":
                            addDept();
                            break;
                        case "BACK":
                            init();
                            break;
                    }
                });
                break;
                case "VIEW all depts, roles, roles by dept, all employees, employees by manager or dept buggets":
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "view",
                            message: "What do you want to view?",
                            choices: ["VIEW all depts", "VIEW all roles", "VIEW all roles by dept", "VIEW all employees", "VIEW employee by manager", "GET utilized budget by dept", "BACK"]
                        }
                    ]).then((response) => {
                        switch (response.view) {
                            case "VIEW all dept":
                                viewAllDept();
                                break;
                            case "VIEW all roles":
                                viewAllRoles();
                                break;
                            case "VIEW all roles by dept":
                                viewRolesByDept();
                                break;
                            case "VIEW all employees":
                                viewAllEmp();
                                break;
                            case "VIEW employee by manager":
                                viewEmpByMgr();
                                break;
                            case "GET utilized budget by dept":
                                viewBudget();
                                break;
                            case "BACK":
                                init();
                                break;
                        }
                    });
                    break;
                case
        }
    })
}