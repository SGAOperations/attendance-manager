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

## Running the Backend

1. Pull the latest version of the backend branch
2. Create a .env file, contact **Logan Ravinuthala** via slack for the database url and with your Public IPv4 address (if not on NU-Wave wifi) to be whitelisted
3. cd into the backend folder and run these three commands:
a. npm install
b. npx prisma generate
c. npx prisma studio

## Running the Frontend

1. Pull the latest version of the frontend branch
2. Make sure you have Node.js installed (version 16 or higher)
3. cd into the frontend folder and run these commands:
4. npm install
5. npm start

## Linting/Prettier
To run Prettier, cd into either frontend or backend and run
```bash
npx prettier . --write
```

## Meet the Team

```
Justin Kim
Jake Wu-Chen
Maggie Chua
Yujin Park
Anusha Narang
Daniel K
Logan Ravinuthala
```

## Todos
- [ ] Have a locally hosted database for dev instead of on Render

- [ ] Refactor code to match common NextJS design

- [ ] Add pipeline checks for frontend

- [ ] Deploy on Vercel
- [ ] Bulk Add Members
- [ ] Add documentation on linking Linear to GitHub
      
