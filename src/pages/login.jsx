import Layout from "../components/Layout";
import {
    Flex,
  } from "@chakra-ui/react";

export default function LoginPage() {
    return (
        <Layout title="Login" noSidebar>
            <Flex minW="100%" minH="100%" justifyContent="center" alignItems="center">
                Login stuff here.
            </Flex>
        </Layout>
    )
}