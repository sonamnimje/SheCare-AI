# SheCare AI Database Setup Guide

This guide will help you set up and connect your SQL database for the SheCare AI application.

## Supported Database Types

The application supports three database types:

1. **SQLite** (Default) - Good for development and small applications
2. **PostgreSQL** - Recommended for production applications
3. **MySQL** - Alternative production database

## Quick Start (SQLite)

For development, SQLite is the easiest option and requires no additional setup:

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the database setup:
   ```bash
   python setup_database.py
   ```

3. Start the server:
   ```bash
   python -m uvicorn main:app --reload
   ```

## PostgreSQL Setup

### 1. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Or use Chocolatey: `choco install postgresql`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

Connect to PostgreSQL as the postgres user:

```bash
sudo -u postgres psql
```

Create the database and user:

```sql
CREATE DATABASE shecare_db;
CREATE USER shecare_user WITH PASSWORD 'shecare_password';
GRANT ALL PRIVILEGES ON DATABASE shecare_db TO shecare_user;
\q
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend/app` directory:

```env
DATABASE_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=shecare_user
POSTGRES_PASSWORD=shecare_password
POSTGRES_DB=shecare_db
SECRET_KEY=your_super_secret_key_change_this_in_production
```

### 4. Run Database Setup

```bash
python setup_database.py
```

## MySQL Setup

### 1. Install MySQL

**Windows:**
- Download MySQL Installer from https://dev.mysql.com/downloads/installer/
- Or use Chocolatey: `choco install mysql`

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Secure MySQL Installation

```bash
sudo mysql_secure_installation
```

### 3. Create Database and User

Connect to MySQL:

```bash
sudo mysql -u root -p
```

Create the database and user:

```sql
CREATE DATABASE shecare_db;
CREATE USER 'shecare_user'@'localhost' IDENTIFIED BY 'shecare_password';
GRANT ALL PRIVILEGES ON shecare_db.* TO 'shecare_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend/app` directory:

```env
DATABASE_TYPE=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=shecare_user
MYSQL_PASSWORD=shecare_password
MYSQL_DB=shecare_db
SECRET_KEY=your_super_secret_key_change_this_in_production
```

### 5. Run Database Setup

```bash
python setup_database.py
```

## Database Models

The application includes the following database models:

- **User**: User accounts and authentication
- **PCOSCheck**: PCOS risk assessment results
- **CycleEntry**: Menstrual cycle tracking data
- **JournalEntry**: User journal entries and mood tracking
- **Recommendation**: Personalized recommendations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_TYPE` | Database type (sqlite, postgresql, mysql) | sqlite |
| `POSTGRES_HOST` | PostgreSQL host | localhost |
| `POSTGRES_PORT` | PostgreSQL port | 5432 |
| `POSTGRES_USER` | PostgreSQL username | shecare_user |
| `POSTGRES_PASSWORD` | PostgreSQL password | shecare_password |
| `POSTGRES_DB` | PostgreSQL database name | shecare_db |
| `MYSQL_HOST` | MySQL host | localhost |
| `MYSQL_PORT` | MySQL port | 3306 |
| `MYSQL_USER` | MySQL username | shecare_user |
| `MYSQL_PASSWORD` | MySQL password | shecare_password |
| `MYSQL_DB` | MySQL database name | shecare_db |
| `SECRET_KEY` | JWT secret key | (auto-generated) |

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Make sure the database service is running
   - Check if the port is correct
   - Verify firewall settings

2. **Authentication Failed**
   - Double-check username and password
   - Ensure the user has proper permissions

3. **Database Not Found**
   - Create the database first
   - Check the database name in environment variables

4. **Permission Denied**
   - Grant proper privileges to the database user
   - Check file permissions for SQLite

### Getting Help

If you encounter issues:

1. Check the error messages from `setup_database.py`
2. Verify your database is running: `sudo systemctl status postgresql` or `sudo systemctl status mysql`
3. Test connection manually using the database client
4. Check the logs for detailed error information

## Production Considerations

For production deployment:

1. **Use PostgreSQL or MySQL** instead of SQLite
2. **Change default passwords** and use strong, unique passwords
3. **Use environment variables** for all sensitive configuration
4. **Enable SSL/TLS** for database connections
5. **Set up proper backups** and monitoring
6. **Use connection pooling** for better performance
7. **Implement proper logging** and error handling

## API Documentation

Once the database is set up and the server is running, you can access:

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health 