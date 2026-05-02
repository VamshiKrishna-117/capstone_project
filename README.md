# YouTube Clone (MERN Stack)

A full-stack web application that replicates the core features of YouTube. Built using MongoDB, Express.js, React, and Node.js (MERN stack).

## Features

- **User Authentication:** Sign up and log in functionalities with secure password hashing.
- **Video Management:** View videos, search for videos, and filter videos by category.
- **Channel System:** View channels, channel details, and the videos uploaded by a specific channel.
- **Interactive Elements:** Like, dislike, and add comments to videos.
- **Responsive Design:** A beautiful and responsive user interface built with React and CSS.

## Tech Stack

- **Frontend:** React (Vite), React Router DOM, Context API for state management, Vanilla CSS.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose for ODM), JWT for authentication.

## Getting Started

Follow these instructions to set up and run the project locally on your machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your computer.

### Important Note About Database Connection

> **Note:** For the purpose of easy evaluation/setup, the `server/.env` file containing the MongoDB Atlas connection key has been intentionally included in this repository. 
> You **do not** need to create your own database or configure environment variables. The application will connect to the cloud database automatically!
> If Mongo Atlas doest work use local url : mongodb://localhost:27017/youtube_clone

### Installation & Running the Project

You will need to run the server and the client concurrently in two separate terminal windows.

#### 1. Start the Backend Server

Open your first terminal and navigate to the project's root directory, then run:

```bash
cd server
npm install
```

*(Optional)* If you ever need to reset the database data, you can run the seed script:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```
The server will start running on `http://localhost:5000` and will display a "MongoDB Connected" message.

#### 2. Start the Frontend Client

Open a second terminal, navigate to the project's root directory, and run:

```bash
cd client
npm install
npm run dev
```
The React development server will start. Open your browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173/`).

## Project Structure

- `client/`: Contains all frontend React code, components, pages, and CSS styles.
- `server/`: Contains all backend Express routes, controllers, MongoDB models, and the database seeding script.

## Contributing

While this is an educational project, feel free to fork the repository, explore the code, and add your own features!
