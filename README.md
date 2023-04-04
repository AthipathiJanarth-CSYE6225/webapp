# CSYE 6225 Assignment 07

- This RESTful API Endpoints are used to create, update and retrieve user detail from MySQL database using Node.js

## `Steps to run the project`

- Fork the organization repository to your profile
- Clone the repository using `git clone <repository link>`
- Checkout to your own branch by running `git checkout -b <BRANCH_NAME>`
- For LOCAl
- Open the terminal and run `npm install` command to install the required node-modules
- Set up the `.env` file with your Database Configuration shown as below
  - DB_USER_NAME=`"database_username"`
  - DB_PASSWORD=`"database_password"`
  - DB_HOST=`"database_servername"`
  - DB_PORT=`"database_port"`
  - DB_NAME=`"database_name"`
- To run the project use `npm run start`
- Perform the change and push it to your branch
- Create a pull request to `main`, the Github actions will run
- For AWS
- On merging a pull request, the github actions will run and create an ami using packer
- Copy the ami id and run infrastructure code which will create an Ec2 instance
