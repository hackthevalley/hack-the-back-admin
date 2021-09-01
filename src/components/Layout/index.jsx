import { Box } from "@chakra-ui/react"


export default function Layout({
    title,
    noSidebar,
    children
}) {
    document.title = `${title} | Hack the Back Admin`

    return (
        <Box bg="gray.50" h="100vh" w="100vw" p={5}>
            {children}
        </Box>
    )
}