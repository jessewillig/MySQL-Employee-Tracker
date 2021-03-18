USE employee_db;

INSERT INTO dept (name)
VALUES
("Sales"),
("Engineer"),
("IT");

INSERT INTO role (title, salary, dept_id)
VALUES
("Sales Manager", 75000, 1),
("Sales Associate", 53500, 1),
("Engineer Manager", 65250, 2),
("Engineer Senior", 60500, 2),
("Engineer Junior", 55490, 2),
("IT Manager", 51350, 3),
("IT Associate", 45349, 3);

INSERT INTO employee (first_name, last_name, role_id, mngr_id)
VALUES
("Jesse", "Johnson", 1, 1),
("Jess", "Smitt", 3, 2),
("Jessica", "Anderson", 6, 3);

INSERT INTO employee (first_name, last_name, role_id)
VALUES
("Jennifer", "Smith", 2),
("Jaylin", "Smith", 2),
("Jacob", "Anderson", 4),
("Fynn", "Johnson", 4),
("Caleb", "Wheeler", 5),
("Kevin", "Smith", 5),
("Leo", "Smitt", 7);