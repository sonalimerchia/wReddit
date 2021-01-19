import React from "react";
import {Formik, Form} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/react";
import {useRegisterMutation} from "../generated/graphql.tsx";
import {toErrorMap} from "../utils/toErrorMap.ts";
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  return (
    <Wrapper>
      <Formik
        initialValues={{email: '', username: '', password: ''}}
        onSubmit={async (values, {setErrors}) => {
          const response = await register({options: values});
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
              //worked return response;
              router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
            <Form>
              <InputField name='email'
                          placeholder='email'
                          type='email'
                          label='Email' />
              <Box mt={4}>
                <InputField name='username'
                            placeholder='username'
                            label='Username' />
              </Box>
              <Box mt={4}>
                <InputField name='password'
                            placeholder='password'
                            label='Password'
                            type='password' />
              </Box>
              <Button mt={4}
                type='submit'
                isLoading={isSubmitting}
                colorScheme='teal'>
                Register
              </Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(Register);
