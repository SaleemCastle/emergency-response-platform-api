# Emergency Response Platform API

A RESTful API built with Express.js for the Emergency Response Platform.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd emergency-response-platform-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your environment variables:
```bash
PORT=3000
NODE_ENV=development
```

## Running the Application

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm start
```

## Testing
```bash
npm test
```

## API Endpoints

- `GET /`: Welcome message
- More endpoints coming soon...

## Project Structure

```
├── src/
│   └── index.js          # Application entry point
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies and scripts
└── README.md           # Project documentation
``` 