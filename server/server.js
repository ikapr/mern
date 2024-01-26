require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/connection');
// const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

// app.use(routes);

const name = `Google Books Search`;
const secret = process.env.SECRET;
const origin = `*`;

const { createServer } = require("http");
const { Server } = require("socket.io");
const { User } = require('./models');
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: origin,
    methods: [`GET`, `POST`, `PUT`, `UPDATE`, `PATCH`, `DELETE`],
    credentials: true
  }
});

app.use(cors({
  origin: origin,
  credentials: true, // If you need to include cookies or authorization headers
}));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    token = req.headers.authorization || req.cookies.jwtToken;
    try {
      let userAuth = jwt.verify(token, secret);
      return { user: userAuth };
    } catch (error) {
      return { user: null };
    }
  }
});

const startApolloServer = async () => {
  await server.start();

  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use(`/graphql`, expressMiddleware(server));

  app.get(`/api`, (req, res) => {
    res.send(`Books Search API`);
  });

  // if we're in production, serve client/dist as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));

    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }
  
  db.once(`open`, async () => {
    
    io.on(`connection`, async (socket) => {
      
      const users = await User.find();
      let globallySharedData = {
        devEnv: process.env.NODE_ENV !== 'production',
        users: JSON.stringify(users),
        serverPort: parseFloat(PORT),
        secret,
        origin,
        name,
      };

      // console.log(`Server Connected to Client, Sending Globally Shared Data`, globallySharedData);
      io.emit(`data`, globallySharedData);
    });

    usersDatabaseWatcher = db.collection(`users`).watch();

    usersDatabaseWatcher.on(`change`, async (usersDatabaseChangeEvent) => {
      const updatedUsers = await User.find();
      io.emit(`usersChanged`, usersDatabaseChangeEvent);
      let globallySharedData = {
        devEnv: process.env.NODE_ENV !== 'production',
        users: JSON.stringify(updatedUsers),
        serverPort: parseFloat(PORT),
        secret,
        origin,
        name,
      };
      io.emit(`data`, globallySharedData);
    });

    httpServer.listen(PORT, () => {
      console.log(`🌍 ${name} Server Now listening on PORT: ${PORT}`);
    });
  });
}

process.on(`SIGINT`, () => {
  usersDatabaseWatcher.close();
  process.exit(0);
});

startApolloServer();