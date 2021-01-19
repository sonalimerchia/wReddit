import React, { useState } from "react";
import {NextPage} from "next";
import {Formik, Form} from "formik";
import {Wrapper} from "../../components/Wrapper";
import {InputField} from "../../components/InputField";
import {Box, Button, Link, Flex} from "@chakra-ui/react";
import NextLink from "next/link";
import {useChangePasswordMutation} from "../../generated/graphql";
import {toErrorMap} from "../../utils/toErrorMap.ts";
import {useRouter} from "next/router";
import {withUrqlClient} from "next-urql";
import {createUrqlClient} from "../../utils/createUrqlClient";

export const ChangePassword: NextPage<{token: string}> = ({token}) => {
  const router = useRouter();
  const [,changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState();

  return (
    <Wrapper>
      <Formik
        initialValues={{password: ''}}
        onSubmit={async (values, {setErrors}) => {
          const response = await changePassword({newPassword: values.password, token});
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
              //worked return response;
              router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
            <Form>
              <InputField name='password'
                          placeholder='new password'
                          label='New Password'
                          type='password' />
              {tokenError ? (
                <Flex>
                  <Box mr={2} style={{color:'red'}}>{tokenError}</Box>
                  <NextLink href='/forgot-password'>
                    <Link>Request new token</Link>
                  </NextLink>
                </Flex>
              ) : null}
              <Button mt={4}
                type='submit'
                isLoading={isSubmitting}
                colorScheme='teal'>
                Set New Password
              </Button>
            </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

ChangePassword.getInitialProps = ({query}) => {
  return {
    token: query.token as string
  };
}

export default withUrqlClient(createUrqlClient)(ChangePassword);
