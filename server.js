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
                case "UPDATE employee manager or employee role":
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "update",
                            message: "What do you want to update?",
                            choices: ["UPDATE employee manager", "UPDATE employee role", "BACK"]
                        }
                    ]).then((response) => {
                        switch (response.update) {
                            case "UPDATE employee manager":
                                updateEmpMgr();
                                break;
                            case "UPDATE employee role":
                                updateEmpRole();
                                break;
                            case "BACK":
                                init();
                                break;
                        }
                    });
                    break;
                case "DELETE employee, role or dept":
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "delete",
                            message: "What do you want to delete?",
                            choices: ["DELETE employee", "DELETE role", "DELETE dept", "BACK"]
                        }
                    ]).then((response) => {
                        switch (response.delete) {
                            case "DELETE employee":
                                deleteEmp();
                                break;
                            case "DELETE role":
                                deleteRole();
                                break;
                            case "DELETE dept":
                                deleteDept();
                                break;
                            case "BACK":
                                init();
                                break;
                        }
                    });
                    break;
                case "QUIT":
                    console.log("See ya later!");
                    connection.end();
                    break;
                default:
                    console.log("Please choose a valid selection");
                    init();
                    break;
        };
    });
};

function addEmp () {
    const roleTitle = [];
    const roleArr = [];
    connection.query("SELECT id, title FROM role", (err, res) => {
        if (err) throw err;
        for (i in res) {
            const newRole = {};
            newRole.id = res[i].id;
            newRole.title = res[i].title;
            roleArr.push(newRole);
            roleTitle.push(res[i].title);
        };
        const empName = [];
        const empArr = [];
        connection.query("SELECT id, first_name, last_name FROM employee", (err, res) => {
            if (err) throw err;
            for (i in res) {
                const newEmp = {};
                newEmp.id = res[i].id;
                const full_name = `${res[i].first_name} ${res[i].last_name}`;
                empArr.push(newEmp);
                empName.push(full_name);
            };
            inquirer.prompt([
                {
                    type: "input",
                    message: "Enter employee first name: ",
                    name: "first_name"
                },
                {
                    type: "input",
                    message: "Enter employee last name: ",
                    name: "last_name"
                },
                {
                    type: "list",
                    message: "Enter employee role: ",
                    choices: roleTitle,
                    name: "role_id"
                },
                {
                    type: "confirm",
                    message: "Is this employee going to be a manager?",
                    name: "mngr_conf"
                },
                {
                    type: "list",
                    message: "Select manager for employee: ",
                    choices: empName,
                    name: "mngr_name",
                    when: function (ans) {
                        if (ans.mngr_conf === true) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            ]).then((ans) => {
                let mngrID;
                for (i in empArr) {
                    if (ans.mngr_name === empArr[i].name) {
                        mngrID = empArr[i].id;
                    };
                };
                let roleID;
                for (i in roleArr) {
                    if (ans.role_id === roleArr[i].title) {
                        roleID = roleArr[i].id;
                    };
                };
                if (ans.mngr_conf = true) {
                    connection.query(`INSERT INTO employee (first_name, last_name, role_id, mngr_id) VALUES ("${ans.first_name}", "${ans.last_name}", "${roleID}", "${mngrID}")`, (err, res) => {
                        if (err) throw err;
                        console.log("Employee has been successfully added!");
                        init();
                    });
                } else {
                    connection.query(`INSERT INTO employee (first_name, last_name, role_id) VALUES ("${ans.first_name}", "${ans.last_name}", "${roleID}")`, (err, res) => {
                        if (err) throw err;
                        console.log("Employee successfully added!");
                        init();
                    });
                };
            });
        });
    });
};

function addRole () {

}