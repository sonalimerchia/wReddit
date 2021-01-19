import React, { useState } from "react";
import {Formik, Form} from "formik";
import {Wrapper} from "../components/Wrapper";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../utils/createUrqlClient";
import {InputField} from "../components/InputField";
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import NextLink from "next/link";
import {useForgotPasswordMutation} from "../generated/graphql"
import {toErrorMap} from "../utils/toErrorMap.ts";
import {useRouter} from "next/router";

export const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const router = useRouter();
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper>
      <Formik
        initialValues={{email: ''}}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) => complete ?
          <Box>
            Password reset link sent if account exists
          </Box> : (
            <Form>
              <InputField name='email'
                          placeholder='email'
                          type='email'
                          label='Email' />
              <Button mt={4}
                type='submit'
                isLoading={isSubmitting}
                colorScheme='teal'>
                Change Password
              </Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default withUrqlClient(createUrqlClient)(ForgotPassword);
