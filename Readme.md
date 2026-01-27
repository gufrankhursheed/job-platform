# Job Platform – Backend (Microservices Architecture)

This repository contains the **backend implementation of a Smart Job / Internship Platform**, built using a **microservices-based architecture**.

Each service is independently deployable and communicates via **HTTP**, **RabbitMQ**, and **Socket.IO**, with an **API Gateway** acting as the single entry point for clients.

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed and running:

- Node.js (v18+ recommended)
- MongoDB
- MySQL
- RabbitMQ

---

## 📦 Installation & Running Services

Each microservice has its **own `package.json`** and runs independently.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/<your-username>/job-platform.git
cd job-platform
```

### 2️⃣ Install Dependencies (Per Service)

Navigate into each service folder and install dependencies:

```bash
cd api-gateway
npm install
```

Repeat the above steps for:

- user-profile-service
- job-service
- application-service
- interview-service
- chat-service
- notification-service

Each service maintains its own dependencies and configuration.

### 3️⃣ Environment Variables

Each service contains its own .env file.

Update the required values such as:

- Database URLs
- JWT secrets
- Google OAuth credentials
- RabbitMQ URL
- Cloudinary credentials
- Service ports

Example .env:
PORT=5000
MONGO_URI=...
MYSQL_URI=...
JWT_SECRET=...
RABBITMQ_URL=...

Make sure the values match your local or deployment environment.

### 4️⃣ Start Services

Run each service in development mode:

```bash
npm run dev
```

⚠️ Ensure MongoDB, MySQL, and RabbitMQ are running before starting the services.

---

## 🧩 Overall Architecture

- Microservices-based system where each service runs independently
- API Gateway acts as the single entry point for frontend clients
- Services communicate via HTTP and event-driven messaging using RabbitMQ
- Real-time features implemented using Socket.IO
- Polyglot persistence:
  - **MongoDB** → Users, Profiles, Chat, Notifications
  - **MySQL** → Jobs, Applications, Interviews

---

## 🔐 1. API Gateway

- **Purpose**

- Central entry point for all client requests
- Handles authentication and authorization
- Proxies requests to downstream services

- **Key Features**

- JWT-based authentication
- Google OAuth integration
- Request routing using proxy middleware

- **Tech Stack**

- Node.js, Express
- MongoDB
- JWT, Google OAuth

---

## 👤 2. User Profile Service

- **Purpose**

- Manages user profiles and resumes

- **Key Features**

- Create, read, update, delete profiles
- Resume upload using Multer and Cloudinary

- **Tech Stack**

- Node.js, Express
- MongoDB
- Multer, Cloudinary

---

## 💼 3. Job Service

- **Purpose**

- Manages job postings

- **Key Features**

- Create, update, delete jobs
- Fetch all jobs and job details

- **Tech Stack**

- Node.js, Express
- MySQL (Sequelize ORM)

---

## 📝 4. Application Service

- **Purpose**

- Handles job applications between candidates and recruiters

- **Key Features**

- Apply to jobs
- Candidate and recruiter application views
- Application status updates
- Publishes application events to RabbitMQ

- **Tech Stack**

- Node.js, Express
- MySQL (Sequelize)
- RabbitMQ

---

## 🗓️ 5. Interview Service

- **Purpose**

- Manages interview scheduling and updates

- **Key Features**

- Schedule, update, cancel interviews
- Recruiter and candidate interview views
- Publishes interview events to RabbitMQ
- Designed for Google Calendar integration

- **Tech Stack**

- Node.js, Express
- MySQL (Sequelize)
- RabbitMQ

---

## 💬 6. Chat Service

- **Purpose**

- Real-time messaging between candidates and recruiters

- **Key Features**

- Real-time chat using Socket.IO
- Message persistence in MongoDB
- Typing indicators
- Delivered and seen message statuses
- Event publishing via RabbitMQ

- **Tech Stack**

- Node.js, Express
- MongoDB
- Socket.IO
- RabbitMQ

---

## 🔔 7. Notification Service

- **Purpose**

- Centralized notification handling

- **Key Features**

- Consumes events from RabbitMQ
- Stores notifications in MongoDB
- Sends real-time notifications via Socket.IO
- Supports read/unread tracking
- Designed for future email and push notification fallbacks

- **Tech Stack**

- Node.js, Express
- MongoDB
- Socket.IO
- RabbitMQ

---

## 🧠 Tech Stack Summary

- **Backend Framework**: Express.js
- **Databases**:
  - MongoDB
  - MySQL (Sequelize)
- **Message Broker**: RabbitMQ
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT + Google OAuth
- **File Storage**: Cloudinary

---
