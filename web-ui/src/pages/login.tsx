import React from "react";
import {Formik, Form} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/react";
import {useMeQuery, useLoginMutation} from "../generated/graphql";
import {toErrorMap} from "../utils/toErrorMap.ts";
import {useRouter} from "next/router";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [, login] = useLoginMutation();

  return (
    <Wrapper>
      <Formik
        initialValues={{username: '', password: ''}}
        onSubmit={async (values, {setErrors}) => {
          const response = await login({options: values});
          console.log(response);
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
                Login
              </Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Login;
