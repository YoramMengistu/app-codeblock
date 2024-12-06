# Coding Web Application

A real-time web application designed for students and mentors to collaborate and solve coding challenges. This application allows students to join code blocks, interact with a mentor, and work on coding problems together.

## Features

- **Role-Based Access**: Mentors and students can join a code block. Mentors have the ability to guide students, while students can work on the code.
- **Real-Time Collaboration**: Using Socket.IO, mentors and students can see real-time updates and collaborate on coding problems.
- **Code Blocks**: A collection of coding challenges stored in MongoDB. Code blocks contain an initial code and a solution that mentors can use to guide students.
- **Socket.IO Integration**: Allows real-time communication and interactions between the client and server.

## Tech Stack

- **Frontend**: React.js (using Vite for fast development)
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (using Mongoose for MongoDB object modeling)
- **Real-Time Communication**: Socket.IO for real-time code sharing and interaction
- **Environment Variables**: `dotenv` for managing configuration settings

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/coding-web-application.git
cd coding-web-application
```
