import React from "react";
import {Box, Button, Link, Flex} from "@chakra-ui/react";
import NextLink from "next/link";
import {useMeQuery, useLogoutMutation} from "../generated/graphql";
import {isServer} from "../utils/isServer";

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{fetching: logoutFetching}, logout] = useLogoutMutation();
  const [{data, fetching}] = useMeQuery({
    pause: isServer()
  });
  let body = null;

  // data is isLoading
  if (fetching) {

    // user not logged in
  } else if(!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link mr={2}>Register</Link>
        </NextLink>
      </>
    );
    // user is logged in
  } else {
    body =
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button onClick={() =>{
          logout();
        }}
          variant='link'
          isLoading={logoutFetching}>Logout</Button>
      </Flex>
  }

  return (
    <Flex bg='tan' p={4}>
      <Box ml={'auto'}>
        {body}
      </Box>
    </Flex>
  );
}
