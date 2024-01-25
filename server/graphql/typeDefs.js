const typeDefs = `
  type Query {
    users: [User!]!
  }

  type User {
    _id: ID!
    email: String!
    username: String!
    password: String!
    createdAt: String
    updatedAt: String
    savedBooks: [Book]
    bookCount: Int
  }

  type Mutation {
    addUser(newUser: NewUserInput): AuthPayload
  }
  
  type Mutation {
    signIn(email: String!, password: String!): AuthPayload
  }

  type AuthPayload {
    token: String
    user: User
  }

  input NewUserInput {
    email: String!
    username: String!
    password: String!
  }

  type Book {
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
    createdAt: String
    updatedAt: String
  }

  input BookInput {
    authors: [String]
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
  }

  type Mutation {
    addBookToSavedBooks(userId: ID!, book: BookInput!): User
  }

  type Mutation {
    removeBookFromSavedBooks(userId: ID!, bookId: ID!): User
  }
`;

module.exports = typeDefs;