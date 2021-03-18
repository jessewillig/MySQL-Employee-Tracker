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
                            choices: ["VIEW all dept", "VIEW all roles", "VIEW all roles by dept", "VIEW all employees", "VIEW employee by manager", "GET utilized budget by dept", "BACK"]
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
                                viewEmpByMngr();
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
                                updateEmpMngr();
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

// add employee function
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

// add role function
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

// add department function
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

// view all departments function
function viewAllDept () {
    // console.log("Hi");
    connection.query(`SELECT name AS "Dept" FROM dept`, (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    });
};

// view all roles
function viewAllRoles() {
    connection.query(`SELECT title AS "Roles", dept.name AS Department, salary AS "Curr Salary" FROM role JOIN dept ON role.dept_id = dept.id ORDER BY dept.name`, (err, res) => {
        if (err) throw err;
        console.table(res);
        init();
    })
};

// view all employees function
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

// view roles by department function
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
            connection.query(`SELECT title, salary FROM role WHERE dept_id = "${deptID}"`, (err, data) => {
                // console.log("Hi");
                if (err) throw err;
                console.table(data);
                init();
            });
        });
    });
};

// view employee by manager function
function viewEmpByMngr () {
    connection.query("SELECT id, first_name, last_name, mngr_id FROM employee", (err, empData) => {
        if (err) throw err;
        const mngrList = [];
        for (i in empData) {
            for (j in empData) {
                if (empData[j].mngr_id === empData[i].id) {
                    mngrList.push(`${empData[i].first_name} ${empData[i].last_name}`);
                };
            };
        };
        inquirer.prompt([
            {
                type: "list",
                message: "Select manager to view employees",
                choices: mngrList,
                name: "mngrChoice"
            }
        ]).then((ans) => {
            let mngrID;
            for (k in empData) {
                if (ans.mngrChoice === `${empData[k].first_name} ${empData[k].last_name}`) {
                    mngrID = empData[k].id;
                };
            };
            connection.query(`SELECT first_name AS "First Name", last_name AS "Last Name", title AS "Role", dept.name AS "Dept", salary AS "Salary" FROM employee JOIN role ON role_id = role.id JOIN dept ON role.dept_id = dept.id WHERE employee.mngr_id = "${mngrID}"`, (err, res) => {
                if (err) throw err;
                console.table(res);
                init();
            });
        });
    });
};

// view budget function
function viewBudget () {
    const newQuery = `SELEct COUNT(role_id) AS role_count, role.title, role.salary, dept.name FROM employee JOIN role ON role_id = role.id JOIN dept ON dept_id = dept.id GROUP BY role_id;`
    connection.query(newQuery, (err, res) => {
        if (err) throw err;
        const totalBudget = [];
        const deptList = [];
        for (i in res) {
            const newBudgetObj = {};
            newBudgetObj.role = res[i].title;
            newBudgetObj.total_cost = res[i].salary * res[i].role_count;
            newBudgetObj.dept = res[i].name;
            totalBudget.push(newBudgetObj);
            deptList.push(res[i].name);
        };
        const newDeptList = [... new Set(deptList)];
        inquirer.prompt([
            {
                type: "list",
                message: "Select dept to view utilized budget",
                choices: newDeptList,
                name: "deptChoice"
            }
        ]).then((ans) => {
            let totalBudget = 0;
            for (j in totalBudget) {
                if (totalBudget[j].dept === ans.deptChoice) {
                    totalBudget += totalBudget[j].total_cost;
                };
            };
            console.table([{ Dept: ans.deptChoice, Budget: `${totalBudget}` }]);
            init();
        });
    });
};

// update manager function
function updateEmpMngr () {
    const nameArr = [];
    connection.query("SELECT id, first_name, last_name, mngr_id FROM employee", (err, res) => {
        if (err) throw err;
        for (i in res) {
            nameArr.push(`${res[i].first_name} ${res[i].last_name}`);
        };
        inquirer.prompt([
            {
                type: "list",
                message: "Select employee to update: ",
                choices: nameArr,
                name: "empSelection"
            },
            {
                type: "list",
                message: "Select new manager for this employee",
                choices: nameArr,
                name: "newMngr"
            }
        ]).then((ans) => {
            let mngrID;
            for (i in res) {
                if (`${res[i].first_name} ${res[i].last_name}` === ans.newMngr) {
                    mngrID = res[i].id;
                };
            };
            if (ans.empSelection === ans.newMngr) {
                console.log("Employee and manager cannot be the same!\nPlease try again...");
                updateEmpMngr();
            } else {
                connection.query(`UPDATE employee SET mngr_id = "${mngrID}" WHERE CONCAT(first_name, " ", last_name) = "${ans.empSelection}"`, (err, res) => {
                    if (err) throw err;
                    console.log("Employee's manager has been successfully updated.");
                    init();
                });
            };
        });
    });
};

// update employee role function
function updateEmpRole () {
    const namesArr = [];
    let empArr;
    const titlesArr = [];
    let roleArr;
    connection.query("SELECT id, title FROM role", (err, roleData) => {
        if (err) throw err;
        for (j in roleData) {
            titlesArr.push(roleData[j].title)
        };
        connection.query("SELECT id, first_name, last_name FROM employee", (err, empData) => {
            if (err) throw err;
            for (i in empData) {
                empArr = empData;
                const fullName = `${empData[i].first_name} ${empData[i].last_name}`;
                namesArr.push(fullName);
                roleArr = empData;
            };
            inquirer.prompt([
                {
                    type: "list",
                    message: "Whose role are you looking to change?",
                    choices: namesArr,
                    name: "empSelection"
                },
                {
                    type: "list",
                    message: "What is this employees new role?",
                    choices: titlesArr,
                    name: "newRole"
                }
            ]).then((ans) => {
                let roleID;
                for (i in roleData) {
                    if (roleData[i].title === ans.newRole) {
                        roleID = roleData[i].id;
                    };
                };
                console.log("new role id: " + roleID);
                connection.query(`UPDATE employee SET role_id = "${roleID}" WHERE CONCAT(first_name, " ", last_name) = "${ans.empSelection}"`, (err, res) => {
                    if (err) throw err;
                    console.log("Employee role has been successfully updated!");
                    init();
                });
            });
        });
    });
};

// delete employee function
function deleteEmp () {
    const empList = [];
    const mngrList = [];
    connection.query("SELECT id, first_name, last_name, mngr_id FROM employee", (err, empData) => {
        if (err) throw err;
        for (i in empData) {
            empList.push(`${empData[i].first_name} ${empData[i].last_name}`);
        };
        for (k in empData) {
            for (j in empData) {
                if (empData[j].mngr_id === empData[k].id) {
                    mngrList.push(`${empData[k].first_name} ${empData[k].last_name}`);
                };
            };
        };
        inquirer.prompt([
            {
                type: "list",
                message: "Select the employee you wish to delete (managers cannot be deleted).",
                choices: empList,
                name: "empSelection"
            }
        ]).then((ans) => {
            if (mngrList.includes(ans.empSelection)) {
                console.log(`\n"${ans.empSelection}" is a manager and cannot be deleted\nNOTE: To delete a manager, all empoyees under that manager must be reassigned\n(Select 'Update Employee Manager' on Main Menu\n\n)`);
                init();
            } else {
                let empID;
                for (l in empData) {
                    if (ans.empSelection === `${empData[l].first_name} ${empData[l].last_name}`) {
                        empID = empData[l].id;
                    };
                };
                connection.query(`DELETE FROM employee WHERE id = "${empID}"`, (err, res) => {
                    if (err) throw err;
                    console.log("Employee successfully deleted.");
                    init();
                });
            };
        });
    });
};

function deleteRole () {
    connection.query(`SELECT title, COUNT(employee.id) AS count FROM role LEFT JOIN employee ON role.id = employee.role_id GROUP BY employee.id;`, (err, data) => {
        if (err) throw err;
        console.table(data);
        const titlesArr = [];
        const rolesArr = [];
        for (i in data) {
            titlesArr.push(`${data[i].title}`);
            if (data[i].count !== 0) {
                rolesArr.push(data[i].title);
            };
        };
        inquirer.prompt([
            {
                type: "list",
                message: "Select role to delete. Filled roles cannot be deleted.",
                choices: titlesArr,
                name: "roleSelection"
            }
        ]).then((ans) => {
            if (rolesArr.includes(ans.roleSelection)) {
                console.log(`\n\nThe role of "${ans.roleSelection}" is filled and cannot be deleted!\n NOTE: to delete a role ALL employees in that role must be reassigned\nSelect "Update Employee Role" on Main Menu\n`);
                init();
            } else {
                connection.query(`DELETE FROM role WHERE title = "${ans.roleSelection}"`, (err, res) => {
                    if (err) throw err;
                    console.log("Role successfully deleted.");
                    init();
                });
            };
        });
    });
};

// delete department function
function deleteDept () {
    const deptArr = [];
    const fullDept = [];
    connection.query(`SELECT name, COUNT(role.id) AS count FROM dept LEFT JOIN role ON dept_id = dept.id GROUP BY name`, (err, data) => {
        for (i in data) {
            deptArr.push(data[i].name);
            if (data[i].count !== 0) {
                fullDept.push(data[i].name);
            };
        };
        inquirer.prompt([
            {
                type: "list",
                message: "Select dept you wish to delete. Filled depts cannot be deleted!",
                choices: deptArr,
                name: "deptselection"
            }
        ]).then((ans) => {
            if (fullDept.includes(ans.deptSelection)) {
                console.log(`\nThe "${ans.deptSelection}" dept has listed roles on file and cannot be deleted!\nNOTE: To delete a dept, first delete all roles in that dept\n(Select 'Delete Role' in Main Menu)\n`);
                init();
            } else {
                connection.query(`DELETE FROM dept WHERE name = "${ans.deptSelection}"`, (err, res) => {
                    if (err) throw err;
                    console.log("Dept has been successfully deleted.");
                    init();
                });
            };
        });
    });
};