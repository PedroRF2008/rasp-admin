"use client";

import React, { useEffect } from "react";
import {Button, Input, Checkbox, Link, Form, Divider} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth";
import toast from "react-hot-toast";
import { LoadingPage } from "@/components/loading";

export default function Component() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <LoadingPage />;
  }

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    const toastId = toast.loading('Entrando...');

    try {
      await signIn(email, password);
      toast.success('Login realizado com sucesso!', { id: toastId });
      router.replace("/admin");
    } catch (error) {
      let errorMessage = 'Credenciais inválidas. Por favor, tente novamente.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Conectando com Google...');

    try {
      await signInWithGoogle();
      toast.success('Login realizado com sucesso!', { id: toastId });
      router.replace("/admin");
    } catch (error) {
      let errorMessage = 'Erro ao entrar com Google. Por favor, tente novamente.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelado. Tente novamente.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up bloqueado pelo navegador.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Esta conta já existe com outro método de login. Por favor, use o método original ou entre em contato com o suporte.';
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-large bg-content1 p-4 shadow-large">
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col items-center pb-4">
          <div className="relative h-[50px] w-[67px] mb-2">
            <Image
              src="/logos/login.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-xl font-medium">Bem-vindo de volta</p>
          <p className="text-small text-default-500">Entre na sua conta para continuar</p>
        </div>
        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            isDisabled={isLoading}
            label="E-mail"
            name="email"
            placeholder="Digite seu e-mail"
            type="email"
            variant="bordered"
          />

          <Input
            isRequired
            isDisabled={isLoading}
            endContent={
              <button type="button" onClick={toggleVisibility}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Senha"
            name="password"
            placeholder="Digite sua senha"
            type={isVisible ? "text" : "password"}
            variant="bordered"
          />

          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm" isDisabled={isLoading}>
              Lembrar-me
            </Checkbox>
            <Link className="text-default-500" href="#" size="sm">
              Esqueceu a senha?
            </Link>
          </div>
          <Button 
            className="w-full" 
            color="primary" 
            type="submit"
            isLoading={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="shrink-0 text-tiny text-default-500">OU</p>
          <Divider className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            startContent={<Icon icon="flat-color-icons:google" width={24} />}
            variant="bordered"
            onClick={handleGoogleSignIn}
            isDisabled={isLoading}
          >
            Continuar com Google
          </Button>
        </div>
      </div>
    </div>
  );
}
