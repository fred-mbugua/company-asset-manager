"# asset-manager" 

Folder structure:

ict-asset-management/
├── dist/                     # Transpiled JavaScript code (auto-generated)
├── src/
│   ├── config/               # Configuration files (DB, JWT, etc.)
│   │   ├── database.ts
│   │   ├── index.ts
│   │   └── jwt.ts
│   ├── controllers/          # Handles incoming requests and responses
│   │   ├── asset.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── employee.controller.ts
│   │   ├── expense.controller.ts
│   │   ├── user.controller.ts
│   │   └── index.ts
│   ├── middlewares/          # Middleware for authentication, logging, etc.
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.ts
│   │   ├── index.ts
│   │   └── logger.middleware.ts
│   ├── models/               # Defines the database schemas
│   │   ├── asset.model.ts
│   │   ├── assignment.model.ts
│   │   ├── employee.model.ts
│   │   ├── expense.model.ts
│   │   ├── user.model.ts
│   │   └── index.ts
│   ├── routes/               # API route definitions
│   │   ├── asset.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── employee.routes.ts
│   │   ├── expense.routes.ts
│   │   ├── user.routes.ts
│   │   ├── index.ts
│   │   └── main.routes.ts
│   ├── services/             # Business logic and external integrations
│   │   ├── asset.service.ts
│   │   ├── auth.service.ts
│   │   ├── employee.service.ts
│   │   ├── expense.service.ts
│   │   ├── index.ts
│   │   ├── email.service.ts
│   │   └── sms.service.ts
│   ├── utils/                # Helper functions
│   │   ├── logger.ts
│   │   └── index.ts
│   ├── server.ts             # Main application entry point
│   └── types.d.ts            # Custom type declarations
├── .env                      # Environment variables
├── .gitignore
├── tsconfig.json
└── package.json