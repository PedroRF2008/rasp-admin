"use client";

import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { Logo } from "./logo";
import { useAuth } from "@/contexts/auth";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { LoadingPage } from "@/components/loading";
import NextLink from "next/link";
import { LinkGoogleModal } from "@/components/modals/link-google-modal";

const navigation = {
  admin: [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "solar:home-2-bold"
    },
    {
      name: "Dispositivos",
      href: "/devices",
      icon: "solar:devices-bold"
    },
    {
      name: "Conteúdo",
      href: "/content",
      icon: "solar:playlist-bold"
    },
    {
      name: "Usuários",
      href: "/users",
      icon: "solar:users-group-rounded-bold"
    }
  ],
  operator: [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: "solar:home-2-bold"
    },
    {
      name: "Conteúdo",
      href: "/content",
      icon: "solar:playlist-bold"
    }
  ]
};

export default function PanelLayout({ children }) {
  const { user, loading, signOut, showLinkGoogleModal, handleLinkGoogle, dismissLinkGoogleModal, userRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [unauthorizedAccess, setUnauthorizedAccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Redirect if no role or on restricted page
  useEffect(() => {
    if (!loading && user && userRole !== null) {
      const allowedPaths = navigation[userRole]?.map(item => item.href) || [];
      if (!allowedPaths.includes(pathname)) {
        setUnauthorizedAccess(true);
      } else {
        setUnauthorizedAccess(false);
      }
    }
  }, [loading, user, userRole, pathname]);

  if (!mounted || loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  // Show error message if no role or unauthorized access
  if (userRole === null || unauthorizedAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <Icon icon="solar:shield-cross-bold" className="text-6xl text-danger mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-default-500 mb-4">
            {userRole === null 
              ? "Sua conta não possui as permissões necessárias para acessar o sistema."
              : "Você não tem permissão para acessar esta página."
            }
            {" "}Entre em contato com um administrador.
          </p>
          {userRole === null ? (
            <Button 
              color="primary" 
              variant="flat"
              onPress={() => signOut()}
            >
              Voltar para Login
            </Button>
          ) : (
            <Button 
              color="primary" 
              variant="flat"
              onPress={() => router.replace('/dashboard')}
            >
              Voltar para Dashboard
            </Button>
          )}
        </div>
      </div>
    );
  }

  const currentNavigation = navigation[userRole] || [];

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await handleLinkGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        classNames={{
          base: "bg-background",
          wrapper: "px-4 sm:px-6",
          item: "data-[active=true]:text-primary data-[active=true]:font-medium",
          content: "h-full",
        }}
        height="60px"
      >
        <NavbarBrand>
          <NavbarMenuToggle className="mr-2 h-6 sm:hidden" />
          <Logo />
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex items-center h-full" justify="center">
          <div className="flex h-10 gap-8 rounded-full bg-default-100 px-6 items-center">
            {currentNavigation.map((item) => (
              <NavbarItem key={item.href} isActive={pathname === item.href}>
                <NextLink 
                  className={`flex items-center gap-2 ${pathname === item.href ? "text-primary" : "text-foreground"}`}
                  href={item.href}
                >
                  <Icon icon={item.icon} width={20} />
                  {item.name}
                </NextLink>
              </NavbarItem>
            ))}
          </div>
        </NavbarContent>
        <NavbarContent className="flex gap-2" justify="end">
          <NavbarItem className="hidden sm:flex">
            <Button 
              isIconOnly 
              radius="full" 
              variant="light"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {mounted && (
                <Icon 
                  className="text-default-500 theme-switch-icon"
                  icon={theme === "dark" ? "solar:sun-linear" : "solar:moon-linear"} 
                  width={24} 
                />
              )}
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  size="sm"
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.email}`}
                />
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Profile Actions" 
                variant="flat"
                className="w-80"
              >
                <DropdownItem
                  key="profile"
                  isReadOnly
                  textValue="Profile"
                  className="opacity-100 hover:bg-transparent cursor-default"
                  showDivider
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="text-default-500 text-xl" icon="solar:user-circle-linear" />
                      <p className="text-small font-semibold text-default-600">
                        {user?.displayName || 'Usuário'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="text-default-500 text-xl" icon="solar:letter-linear" />
                      <p className="text-tiny text-default-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<Icon className="text-xl text-default-500" icon="solar:settings-linear" />}
                  description="Preferências, notificações e segurança"
                  className="h-12"
                >
                  Configurações
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<Icon className="text-xl" icon="solar:logout-3-linear" />}
                  className="h-12 text-danger"
                  onClick={signOut}
                >
                  Sair da conta
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          {currentNavigation.map((item) => (
            <NavbarMenuItem key={item.href} isActive={pathname === item.href}>
              <NextLink 
                className={`w-full ${pathname === item.href ? "text-primary" : "text-foreground"}`}
                href={item.href}
              >
                {item.name}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </NavbarMenu>
      </Navbar>
      <main className="container mx-auto px-6 py-4">
        {children}
      </main>
      
      <LinkGoogleModal 
        isOpen={showLinkGoogleModal}
        onClose={dismissLinkGoogleModal}
        onConfirm={handleConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}
