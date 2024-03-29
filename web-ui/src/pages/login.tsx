import React from "react";
import {Formik, Form} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import NextLink from "next/link";
import {useLoginMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap";
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper>
      <Formik
        initialValues={{usernameOrEmail: '', password: ''}}
        onSubmit={async (values, {setErrors}) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
              //worked return response;
              router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
            <Form>
              <InputField name='usernameOrEmail'
                          placeholder='username or email'
                          label='Username or Email' />
              <Box mt={4} >
                <InputField name='password'
                            placeholder='password'
                            label='Password'
                            type='password' />
              </Box>
              <Flex>
                <NextLink href='/forgot-password'>
                  <Link ml='auto'>Forgot Password?</Link>
                </NextLink>
              </Flex>
              <Button mt={4}
                type='submit'
                isLoading={isSubmitting}
                colorScheme='teal'>
                Login
              </Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Login);
