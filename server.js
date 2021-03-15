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
    const deptArr = [];
    connection.query("SELECT id, name FROM dept;", (err, res) => {
        if (err) throw err;
        for (i in res) {
            roleObj = {};
            roleObj.id = res[i].id;
            roleObj.name = res[i].name;
            deptArr.push(roleObj);
        };
        inquirer.prompt([
            {
                type: "list",
                message: "Enter dept name for new role: ",
                choices: deptArr,
                name: "deptName"
            },
            {
                type: "input",
                message: "Enter title of new role: ",
                name: "role"
            },
            {
                type: "number",
                message: "Enter salary for new role: ",
                name: "salary"
            }
        ]).then((ans) => {
            let deptID;
            for (i in deptArr) {
                if (deptArr[i].name === ans.deptName) {
                    deptID = deptArr[i].id;
                };
            };
            connection.query(`INSERT INTO role (title, salary, dept_ID) VALUES ("${ans.roleName}", "${ans.salary}", "${deptID}")`, (err, res) => {
                if (err) throw err;
                console.log("Role successfully added!");
                init();
            });
        });
    });
};

function addDept () {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter dept name: ",
            name: "deptName"
        }
    ]).then((ans) => {
        connection.query(`INSERT INTO dept (name) VALUE ("${ans.deptName}")`, (err, res) => {
            if (err) throw err;
            console.log(`Dept "${ans.deptName}" has been successfully added!`);
            init();
        });
    });
};

function viewAllDept () {
    connection.query(`SELECT name AS "Dept" FROM dept`, (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    });
};

function viewAllEmp () {
    connection.query(`SELECT employee.id, first_name, last_name, salary, mngr_id, dept.name, role.title FROM employee JOIN role ON employee.role_id = role.id JOIN dept ON role.dept_id = dept.id ORDER BY dept.name;`, (err, res) => {
        if (err) throw err;
        const allEmp = [];
        for (i in res) {
            const newView = {};
            newView.Name = `${res[i].first_name} ${res[i].last_name}`;
            newView.Role = res[i].title;
            newView.Dept = res[i].name;
            newView.Salary = `${res[i].salary} / Year`;
            for (j in res) {
                if (res[i].mngr_id === res[j].id) {
                    newView.Mngr = `${res[j].first_name} ${res[j].last_name};`
                };
            };
            allEmp.push(newView);
        };
        console.table(allEmp);
        init();
    });
};

function viewRolesByDept () {
    connection.query("SELECT id, name FROM dept;", (err, res) => {
        const deptNames = [];
        for (i in res) {
            deptNames.push(res[i].name);
        }
        inquirer.prompt([
            {
                type: "list",
                message: "Select dept to view roles",
                choices: deptNames,
                name: "deptName"
            }
        ]).then((ans) => {
            let deptID;
            for (j in res) {
                if (ans.deptName === res[j].name) {
                    deptID = res[j].id;
                };
            };
            connection.query(`SELECT title, salary FROM role WHERE dept_id = "${deptID}`, (err, data) => {
                console.table(data);
                init();
            });
        });
    });
};