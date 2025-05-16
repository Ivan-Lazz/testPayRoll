# Pay Slip Generator System

A simple web-based system for generating employee payslips with PDF export functionality.

## Features

- User Management
- Employee Management
- Employee Accounts Management
- Banking Details Management
- Payslip Generation
- PDF Generation for Payslips (Agent and Admin views)
- Dashboard with Statistics

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache, Nginx, etc.)
- Composer (for dependencies)

## Installation

1. Clone the repository to your local machine or server:

```
git clone https://github.com/yourusername/payslip-generator.git
```

2. Navigate to the project directory:

```
cd payslip-generator
```

3. Install PHP dependencies using Composer:

```
composer require setasign/fpdf
composer require setasign/fpdi
```

4. Create an uploads directory for PDF files:

```
mkdir -p uploads/payslips
chmod 777 uploads/payslips
```

5. Configure your web server to point to the project directory, or use PHP's built-in server for development:

```
php -S localhost:8000
```

6. Access the application in your web browser:

```
http://localhost:8000
```

## Database Setup

The system will automatically create the database and required tables when you first access it. You don't need to manually set up the database.

## Default Login Credentials

After installation, you can log in with the following default admin credentials:

- Username: `admin`
- Password: `Admin@123`

**Important**: Change the default password immediately after your first login for security reasons.

## Project Structure

```
payslip-generator/
├── backend/              # API and server-side code
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers
│   ├── models/           # Database models
│   ├── utils/            # Utility classes
│   ├── .htaccess         # Apache configuration
│   └── api.php           # API entry point
├── frontend/             # User interface
│   ├── assets/           # CSS, JavaScript, images
│   ├── includes/         # Reusable PHP components
│   ├── pages/            # Application pages
│   ├── index.php         # Dashboard page
│   └── login.php         # Login page
├── database/             # Database files
│   └── schema.sql        # Database schema
├── uploads/              # Generated PDFs
│   └── payslips/         # Payslip PDFs
├── vendor/               # Composer dependencies
├── composer.json         # Composer configuration
└── README.md             # Project documentation
```

## API Endpoints

### Users

- `GET /users` - Get all users
- `GET /users/get/{id}` - Get user by ID
- `POST /users/create` - Create a new user
- `PUT /users/update/{id}` - Update a user
- `DELETE /users/delete/{id}` - Delete a user
- `POST /users/login` - User login

### Employees

- `GET /employees` - Get all employees
- `GET /employees/get/{id}` - Get employee by ID
- `POST /employees/create` - Create a new employee
- `PUT /employees/update/{id}` - Update an employee
- `DELETE /employees/delete/{id}` - Delete an employee

### Employee Accounts

- `GET /accounts` - Get all employee accounts
- `GET /accounts/get/{id}` - Get account by ID
- `GET /accounts/employee/{employeeId}` - Get accounts by employee ID
- `POST /accounts/create` - Create a new account
- `PUT /accounts/update/{id}` - Update an account
- `DELETE /accounts/delete/{id}` - Delete an account

### Banking Details

- `GET /banking` - Get all banking details
- `GET /banking/get/{id}` - Get banking details by ID
- `GET /banking/employee/{employeeId}/accounts` - Get banking details by employee ID
- `POST /banking/create` - Create new banking details
- `PUT /banking/update/{id}` - Update banking details
- `DELETE /banking/delete/{id}` - Delete banking details

### Payslips

- `GET /payslips` - Get all payslips
- `GET /payslips/get/{id}` - Get payslip by ID
- `GET /payslips/employee/{employeeId}` - Get payslips by employee ID
- `POST /payslips/create` - Create a new payslip
- `PUT /payslips/update/{id}` - Update a payslip
- `DELETE /payslips/delete/{id}` - Delete a payslip
- `GET /payslips/download/{id}/{type}` - Download payslip PDF

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributors

- [Your Name](https://github.com/yourusername)

## Acknowledgements

- [FPDF](http://www.fpdf.org/) - PDF generation library
- [FPDI](https://www.setasign.com/products/fpdi/about/) - PDF manipulation library