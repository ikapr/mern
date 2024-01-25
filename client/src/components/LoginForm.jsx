// see SignupForm.js for comments
import { useContext, useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Form, Button, Alert } from 'react-bootstrap';

// import { loginUser } from '../utils/API';
import Auth from '../utils/auth';
import { GloballySharedData } from '../App';

const LoginForm = () => {
  let { setUser, users } = useContext(GloballySharedData);

  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  let [signInMutation] = useMutation(gql`
    mutation SignIn($email: String!, $password: String!) {
      signIn(email: $email, password: $password) {
        token
        user {
          _id
          email
          username
          createdAt
          updatedAt
          savedBooks {
            link
            title
            image
            bookId
            authors
            createdAt
            updatedAt
            description
          }
        }
      }
    }
  `);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      // const response = await loginUser(userFormData);

      // if (!response.ok) {
      //   throw new Error('something went wrong!');
      // }

      // const { token, user } = await response.json();
      // console.log(user);
      // Auth.login(token);

      let { email: emailField, password: passwordField } = event.target;

      let signInVariables = {
        variables: {
          password: passwordField.value,
          email: emailField.value,
        }
      };

      const signInResponse = await signInMutation(signInVariables);

      const { token, user } = signInResponse.data.signIn;

      let userFromEmail = users.find(usr => usr.email == emailField.value);

      let userDB = users.find(usr => usr._id == user._id) || users.find(usr => usr.id == user.id) || userFromEmail;
      localStorage.setItem(`user`, JSON.stringify(userDB));
      setUser(userDB);
      Auth.login(token);

    } catch (err) {
      console.error(err);
      setShowAlert(true);
    }

    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;