# SGA Dashboard

A React TypeScript application for managing student government association activities, including meetings, attendance tracking, and dashboard functionality.

## Features

- **Authentication System**: Login with different user roles (user/admin)
- **Dashboard**: Calendar view with scheduled meetings
- **Navigation**: Sidebar with Dashboard, Meetings, and Attendance sections
- **Responsive Design**: Built with Tailwind CSS
- **TypeScript**: Full type safety throughout the application

## Project Structure

```
src/
├── components/
│   ├── attendance     # Attendance components
│   ├── dashboard/     # Dashboard components
│   ├── layout/        # Layout components (Header, Sidebar)
│   ├── meetings/      # Meetings components
│   └── profile/       # Profile components
├── contexts/         # React contexts
├── pages/           # Page components
└── types/           # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the project directory:

   ```bash
   cd sga
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

### Login

- Use any email and password to log in
- Emails containing "admin" will be assigned admin role
- Other emails will be assigned user role

### Dashboard Features

- **Calendar**: Interactive calendar showing scheduled meetings
- **Meetings List**: View meetings for selected dates
- **Navigation**: Switch between Dashboard, Meetings, and Attendance sections

## Development

### Code Formatting

This project uses Prettier for consistent code formatting. The VS Code settings are configured to:

- Format on save
- Use Prettier as the default formatter
- Auto-fix ESLint issues on save

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (not recommended)

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Prettier** - Code formatting
- **Create React App** - Build tool and development environment

## Folder Structure

The project follows a modular structure:

- **Components**: Reusable UI components organized by feature
- **Contexts**: React contexts for state management
- **Types**: TypeScript type definitions
- **Pages**: Main page components
- **Layout**: Header, sidebar, and main layout components

## Contributing

1. Follow the existing code style (Prettier configuration)
2. Use TypeScript for all new code
3. Add proper type definitions for new features
4. Test your changes before submitting

## License

This project is licensed under the MIT License.
