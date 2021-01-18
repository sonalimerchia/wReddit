import React from "react";
import {Formik, Form} from "formik";
import {Wrapper} from "../components/Wrapper";
import {InputField} from "../components/InputField";
import {Box, Button} from "@chakra-ui/react";
import {useRegisterMutation} from "../generated/graphql.tsx";
import {toErrorMap} from "../utils/toErrorMap.ts";
import {useRouter} from "next/router";

interface registerProps {

}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  return (
    <Wrapper>
      <Formik
        initialValues={{username: '', password: ''}}
        onSubmit={async (values, {setErrors}) => {
          const response = await register(values);
          console.log(response);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
              //worked return response;
              console.log("here");
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
                Register
              </Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;
