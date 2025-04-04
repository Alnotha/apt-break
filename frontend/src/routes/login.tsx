import { Container, Image, Input, Text } from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import Logo from "/assets/images/fastapi-logo.svg"
import { emailPattern, passwordRules } from "../utils"

export const Route = createFileRoute("/login")({
  component: Login,
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
      // Convert email to username format if needed
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
