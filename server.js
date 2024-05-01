require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(
    process.env.DATABASE_URL || `postgress://localhost/${process.env.DB_NAME}`
);

const express = require('express');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

// read employees
app.get('/api/employees', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM employee`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// read departments
app.get('/api/departments', async (req, res, next) => {
    try {
        const SQL = `SELECT * FROM department`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

// create employee
// curl localhost:3000/api/employees -X POST -d '{"name":"A New note", "department_id":1, "ranking": 17}' -H "Content-Type:application/json"
app.post('api/employees', async (req, res, next) => {
    try {
        const SQL = /* sql */ 
        `
        INSERT INTO employee(name, department_id)
        VALUES($1, $2)
        RETURNING *
    `;
        const response = await client.query(SQL, [req.body.name, req.body.department_id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    }
});


//create and seed tables, initilaize
const init = async () => {
    await client.connect();

    let SQL = /* sql */
    `
    DROP TABLE IF EXISTS employee;
    DROP TABLE IF EXISTS department;

    CREATE TABLE department (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
    );

    CREATE TABLE employee (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        department_id INTEGER REFERENCES department(id) NOT NULL
    );
    `;

    await client.query(SQL);
    console.log('tables created');

    SQL = /* sql */
    `
    INSERT INTO department(name) VALUES('Executives');
    INSERT INTO department(name) VALUES('Accounting');
    INSERT INTO department(name) VALUES('Janitorial');

    INSERT INTO employee(name, department_id) VALUES('make executive decisions',
     (SELECT id FROM department WHERE name='Executives'));

    INSERT INTO employee(name, department_id) VALUES('run the numbers',
     (SELECT id FROM department WHERE name='Accounting')); 
    
    INSERT INTO employee(name, department_id) VALUES('clean building',
     (SELECT id FROM department WHERE name='Janitorial')); 
    `;
    
    await client.query(SQL);
    console.log('data seeded');
    
    const port = process.env.PORT;
    app.listen(port, () => {console.log(`listening on ${port}`);
    });
};

init();