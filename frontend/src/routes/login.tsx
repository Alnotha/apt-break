// import { Container, Image, Input, Text, Box, HStack, Flex } from "@chakra-ui/react"
import { Container, Image, Input, Text, Box} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"
// import { FcGoogle } from "react-icons/fc"
import { z } from "zod"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import Logo from "/assets/images/aptbreak-logo.svg"
import { emailPattern, passwordRules } from "../utils"

const loginSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    // If there's a token, store it and redirect
    if (search.token) {
      localStorage.setItem("access_token", search.token)
      throw redirect({
        to: "/",
      })
    }
    // Otherwise, check if already logged in
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { loginMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
      grant_type: "password",
    },
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    resetError()

    try {
      const loginData = {
        ...data,
        username: data.username.toLowerCase().trim(),
        grant_type: "password",
      }
      await loginMutation.mutateAsync(loginData)
    } catch {
      // error is handled by useAuth hook
    }
  }

  // const handleGoogleLogin = () => {
  //   // Get the base API URL without trailing slash
  //   const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    
  //   // Check if we're in production
  //   const isProduction = !baseUrl.includes('localhost');
    
  //   // Use the appropriate base URL
  //   const apiBaseUrl = isProduction 
  //     ? 'https://api.aptbreak.com'
  //     : 'http://localhost:8000';
    
  //   // Construct the full URL
  //   const loginUrl = `${apiBaseUrl}/api/v1/auth/login/google`;
    
  //   // Redirect to Google login
  //   window.location.href = loginUrl;
  // }

  return (
    <>
    <Box bg="#38572d" h="100vh" w="100vw">
      <Container
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        h="100vh"
        maxW="sm"
        alignItems="stretch"
        justifyContent="center"
        gap={4}
        centerContent
        bg="#38572d"
      >
        <Image
          src={Logo}
          alt="FastAPI logo"
          height="auto"
          maxW="2xs"
          alignSelf="center"
          mb={4}
        />
        <Field
          invalid={!!errors.username}
          errorText={errors.username?.message || !!error}
        >
          <InputGroup w="100%" startElement={<FiMail />}>
            <Input
              id="username"
              {...register("username", {
                required: "Email is required",
                pattern: emailPattern,
              })}
              placeholder="Email"
              type="email"
              autoComplete="email"
              color="#eebd40" // Text color
              bg="transparent" // Ensure the background stays transparent
              _placeholder={{ color: "#eebd40" }} // Placeholder color
              border="1px solid #eebd40" // Border color

            />
          </InputGroup>
        </Field>
        <PasswordInput
          type="password"
          startElement={<FiLock />}
          {...register("password", passwordRules())}
          placeholder="Password"
          errors={errors}
          autoComplete="current-password"
          color="#eebd40"
          _placeholder={{ color: "#eebd40" }} 
          border = "1px solid #eebd40"
        />
        <RouterLink to="/recover-password" className="main-link">
          Forgot Password?
        </RouterLink>

        <Button
        variant="solid"
        type="submit"
        loading={isSubmitting}
        size="md"
        bg="#eebd40"
        color="white"
        _hover={{ bg: "#d4a732" }}
      >
      
        Log In
      </Button>
        
        {/* <Flex w="100%" align="center" gap={2} my={2}>
          <Box flex="1" h="1px" bg="gold.200" />
          <Text color="gold.500" fontSize="sm">OR</Text>
          <Box flex="1" h="1px" bg="gold.200" />
        </Flex>
        
        <Button
          variant="outline"
          size="md"
          onClick={handleGoogleLogin}
          w="100%"
        >
          <HStack gap={2}>
            <FcGoogle size={20} />
            <Text>Continue with Google</Text>
          </HStack>
        </Button> */}

        <Text color="#eebd40">
          Don't have an account?{" "}
          <RouterLink to="/signup" className="main-link">
            Sign Up
          </RouterLink>
        </Text>
      </Container>
    </Box>
    </>
  )
}
