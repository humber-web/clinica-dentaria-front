<script setup lang="ts">
import { ref } from "vue";

type LoginResponse = { access_token: string };
type UserResponse = { perfil: { perfil: string } | null };

const config = useRuntimeConfig();
const baseUrl = config.public.apiBase;

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const onSubmit = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  error.value = "";
  try {
    const form = new URLSearchParams();
    form.append("username", email.value);
    form.append("password", password.value);

    const { data, error: fetchError } = await useFetch<LoginResponse>(
      `${baseUrl}utilizadores/login`,
      {
        method: "POST",
        body: form,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        onResponseError({ response }) {
          error.value = response._data?.detail || "Erro ao fazer login";
        },
      }
    );
    if (fetchError.value) return;

    const token = data.value?.access_token;
    if (token) {
      useCookie("token").value = token;
      const { data: user } = await useFetch<UserResponse>(
        `${baseUrl}utilizadores/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (user.value && user.value.perfil && user.value.perfil.perfil) {
        switch (user.value.perfil.perfil) {
          case "frontdesk":
            return navigateTo("/master");
          case "gerente":
            return navigateTo("/diretor");
          case "doctor":
            return navigateTo("/doctor");
          case "assistant":
            return navigateTo("/assistant");
          case "master_admin":
            return navigateTo("/master");
          default:
            return navigateTo("/");
        }
      }
    } else {
      error.value = "Login inválido";
    }
  } catch (err: any) {
    error.value = err.message || "Erro ao fazer login";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Card class="mx-auto max-w-sm">
    <form @submit="onSubmit">
      <CardHeader>
        <CardTitle class="text-2xl"> Login </CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">Password</Label>
              <a href="#" class="ml-auto inline-block text-sm underline">
                Forgot your password?
              </a>
            </div>
            <Input id="password" v-model="password" type="password" required />
          </div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? "Entrando..." : "Login" }}
          </Button>
        </div>
        <div v-if="error" class="mt-4">
          <Alert variant="destructive">
            <AlertCircle class="w-4 h-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {{ error }}
            </AlertDescription>
          </Alert>
        </div>
        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <NuxtLink to="/register" class="underline"> Sign up </NuxtLink>
        </div>
      </CardContent>
    </form>
  </Card>
</template>
