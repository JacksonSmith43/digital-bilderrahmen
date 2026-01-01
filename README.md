# Getting Started
## Startup Sequence
### Short Version: .\quick-start.ps1. Step one to three can be skipped if the short version is used. Docker has to have been running first though. 
### Step 1: Start the Database (PostgreSQL)

```powershell
docker-compose -f docker-compose.yml up -d
```

This starts the PostgreSQL Container which is only an empty data storage. It saves data (images, users).
It uses the port: 5432.

### Step 2: Start the Backend (Spring Boot API)

```powershell
cd backend
.\mvnw spring-boot:run
```

This starts the Java application and connects to the database.
This runs as a Java process and not Docker. This contains the program logic. It connects to PostgreSQL through port 5432.
It uses the port: 8080.

The Backend runs on: http://localhost:8080

### Step 3: Start the Frontend (Angular)

```powershell
cd frontend
npm install
npm start
```

This will run as a Node.js process and will display the website, whilst sending requests to the backend through port 8080.
This uses the port: 4200.

The Frontend runs on: http://localhost:4200

### Step 4: Start Spring
This can be done by running one of the Java Applications in the IDE. 


> [!Note]
> For more information regarding frontend setup, look at the Frontend Readme file.

## Technology Stack

Frontend:

- Angular
- TypeScript
- Node.js
- NPM

Backend:

- Spring Boot
- Maven
- JPA/Hibernate

Database:

- PostgreSQL
- Docker
- pgAdmin
