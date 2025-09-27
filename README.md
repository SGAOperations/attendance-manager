# SGA Attendance Manager

The purpose of this application is to streamline the attendance system at SGA (Student Government Association).

## Tech Stack

Common:

- [TypeScript](https://www.typescriptlang.org/)

Frontend:

- Framework: [React](https://react.dev/)
- Styling: [Tailwind CSS](https://tailwindcss.com/docs/installation)

Backend:

- Framework: [Next.js](https://nextjs.org/docs)
- ORM: [Prisma](https://www.prisma.io/docs)
- Database: [PostgreSQL](https://www.postgresql.org/docs/) (hosted on [Firebase](https://firebase.google.com/docs))

Hosting/Deployment:
- [Vercel](https://vercel.com/docs)

Authentication: TBD

Components: TBD

## Setting up the development environment

Prerequisites: make sure everything is installed

1. [node/npm](https://nodejs.org/en)
   - To check if it's installed: `node -v` and `npm -v`
   - To install: for [mac/linux](https://github.com/nvm-sh/nvm) and [windows](https://github.com/coreybutler/nvm-windows) (setup instructions are in the link under the `Installing and Updating` and `Installation & Upgrades` sections, respectively)

First, clone the repo and `cd` into the directory

```bash
git clone https://github.com/SGAOperationalAffairs/new-attendance-manager.git
cd new-attendance-manager
cd attendance-manager
```

Then, install the dependencies

```bash
npm install
```

## Running the app

To run both the frontend and backend run 
```bash
npm run dev
```

## Linting/Prettier
To run Prettier
```bash
npx prettier . --write
```

## Meet the Team

```
Jake Wu-Chen
Yujin Park
Anusha Narang
Daniel Kaplan
Logan Ravinuthala
Natalia Ivanov
```

## Todos
- [ ] Have a locally hosted database for dev instead of on Render

- [ ] Refactor code to match common NextJS design

- [ ] Clean up pipeline checks

- [ ] Deploy on Vercel
- [ ] Bulk Add Members
- [ ] Add documentation on linking Linear to GitHub
- [ ] Unit test for both frontend and backend
- [ ] Allow users to make requests and admin to approve/deny requests
