import React from "react";
import {Formik, Form} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/react";
import {useMutation} from "urql";

interface registerProps {

}

const REGISTER_MUTATION = `
  mutation Register($username: String!, $password: String!){
    register(options: {username: $username, password:$password}) {
      errors {
        field
        message
      }
      user {
        id
      	username
      }
    }
  }
`

const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUTATION);

  return (
    <Wrapper>
      <Formik
        initialValues={{username: '', password: ''}}
        onSubmit={(values) => {
          return register(values);
        }}
      >
        {({ isSubmitting }) => (
            <Form>
              <InputField name='username'
                          placeholder='username'
                          label='Username' />
              <Box mt={4} >
                <InputField name='password'
                            placeholder='password'
                            label='Password'
                            type='password' />
              </Box>
              <Button mt={4}
                type='submit'
                isLoading={isSubmitting}
                colorScheme='teal'>
                Sign Up
              </Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;
