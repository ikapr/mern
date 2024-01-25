import { useState, useEffect, useContext } from 'react';
import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';

// import { deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { getSavedBookIds, removeBookId } from '../utils/localStorage';
import { GloballySharedData } from '../App';
import { gql, useMutation } from '@apollo/client';

const SavedBooks = () => {
  let { state, user, users } = useContext(GloballySharedData);
  const [userData, setUserData] = useState(user && user != null && user.savedBooks ? user : {});
  let [loading, setLoading] = useState(true);
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [removeBookMutation] = useMutation(gql`
    mutation RemoveBookFromSavedBooks($userId: ID!, $bookId: ID!) {
      removeBookFromSavedBooks(userId: $userId, bookId: $bookId) {
        _id
        email
        username
        savedBooks {
          authors
          description
          bookId
          image
          link
          title
        }
      }
    }
  `);

  // use this to determine if `useEffect()` hook needs to run again
  const userDataLength = 0;

  useEffect(() => {
    const getUserData = async () => {
      try {
        if (user && user != null && user.savedBooks) {
          // console.log(`User Data`, user);
          setLoading(false);
          setUserData(user);
        } else {
          // const token = Auth.loggedIn() ? Auth.getToken() : null;

          // if (!token) {
          //   return false;
          // }

          // const response = await getMe(token);

          // if (!response.ok) {
          //   throw new Error('something went wrong!');
          // }

          // const databaseUser = await response.json();

          setLoading(false);
          setUserData({});
        }
      } catch (error) {
        console.log(`Error getting User Data`, error);
        setLoading(false);
      }
    };

    getUserData();
    if (userDataLength === 0) setLoading(false);
  }, [user, state, users, userDataLength]);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // const response = await deleteBook(bookId, token);

      // if (!response.ok) {
      //   throw new Error('something went wrong!');
      // }

      // const updatedUser = await response.json();
      // setUserData(updatedUser);
      // // upon success, remove book's id from localStorage
      
      let loggedInUser = Auth.getProfile();
      let vars = { variables: { userId: loggedInUser.userId, bookId: bookId } };
      await removeBookMutation(vars);
      removeBookId(bookId);

      // Update local state to reflect the removal
      setSavedBookIds(savedBookIds.filter(id => id !== bookId));
    } catch (error) {
      console.log(`Error Removing Book`, error);
    }
  };

  // if data isn't here yet, say so
  if (!userDataLength && user != null && !user.savedBooks) {
    return <h2>{loading ? `LOADING ...` : user && user != null ? `No Books` : `Log In to See Saved Books`}</h2>;
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData && userData.savedBooks && userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData && userData.savedBooks && userData.savedBooks.map((book, bookIndex) => {
            return (
              <Col md="3" key={bookIndex}>
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;