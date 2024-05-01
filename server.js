require('dotenv').config();
const express = require('express');
const app = express();
const pg = require('pg');
const client = new pg.Client(
    process.env.DATABASE_URL || `postgress://localhost/${process.env.DB_NAME}`
);

//create and seed tables
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