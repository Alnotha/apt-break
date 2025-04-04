import { Container, Image, Input, Text, Box, HStack, Flex } from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import { useEffect } from "react"
import { z } from "zod"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import Logo from "/assets/images/fastapi-logo.svg"
import { emailPattern, passwordRules } from "../utils"

const loginSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search) => loginSearchSchema.parse(search),
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { loginMutation, error, resetError } = useAuth()
  const { token } = Route.useSearch()
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

  useEffect(() => {
    if (token) {
      // Store the token from Google OAuth
      localStorage.setItem("token", token)
      // Redirect to home page
      window.location.href = "/"
    }
  }, [token])

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

  const handleGoogleLogin = () => {
    // Get the base API URL without trailing slash
    const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '');
    
    // Check if the API URL already contains /api/v1
    const apiPath = baseUrl.includes('/api/v1') ? '/auth/login/google' : '/api/v1/auth/login/google';
    
    window.location.href = `${baseUrl}${apiPath}`;
  }

  return (
    <>
      <Container
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        h="100vh"
        maxW="sm"
        alignItems="stretch"
        justifyContent="center"
        gap={4}
        centerContent
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
        />
        <RouterLink to="/recover-password" className="main-link">
          Forgot Password?
        </RouterLink>
        <Button variant="solid" type="submit" loading={isSubmitting} size="md">
          Log In
        </Button>
        
        <Flex w="100%" align="center" gap={2} my={2}>
          <Box flex="1" h="1px" bg="gray.200" />
          <Text color="gray.500" fontSize="sm">OR</Text>
          <Box flex="1" h="1px" bg="gray.200" />
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
        </Button>
        <Text>
          Don't have an account?{" "}
          <RouterLink to="/signup" className="main-link">
            Sign Up
          </RouterLink>
        </Text>
      </Container>
    </>
  )
}
