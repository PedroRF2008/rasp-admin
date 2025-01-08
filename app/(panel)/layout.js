"use client";

import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
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

const navigation = [
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
  }
];

export default function PanelLayout({ children }) {
  const { user, loading, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (!mounted || loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        classNames={{
          base: "bg-background",
          wrapper: "px-4 sm:px-6",
          item: "data-[active=true]:text-primary data-[active=true]:font-medium",
        }}
        height="60px"
      >
        <NavbarBrand>
          <NavbarMenuToggle className="mr-2 h-6 sm:hidden" />
          <Logo />
        </NavbarBrand>
        <div className="flex-1 flex justify-center">
          <NavbarContent
            className="hidden h-12 gap-4 rounded-full bg-default-100 px-4 sm:flex"
          >
            <NavbarItem isActive={pathname === "/dashboard"}>
              <NextLink 
                className={`flex gap-2 ${pathname === "/dashboard" ? "text-primary" : "text-foreground"}`}
                href="/dashboard"
              >
                Dashboard
              </NextLink>
            </NavbarItem>
            <NavbarItem isActive={pathname === "/devices"}>
              <NextLink 
                className={`flex gap-2 ${pathname === "/devices" ? "text-primary" : "text-foreground"}`}
                href="/devices"
              >
                Dispositivos
              </NextLink>
            </NavbarItem>
            <NavbarItem isActive={pathname === "/content"}>
              <NextLink 
                className={`flex gap-2 ${pathname === "/content" ? "text-primary" : "text-foreground"}`}
                href="/content"
              >
                Conteúdo
              </NextLink>
            </NavbarItem>
          </NavbarContent>
        </div>
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
          <NavbarMenuItem isActive={pathname === "/dashboard"}>
            <NextLink 
              className={`w-full ${pathname === "/dashboard" ? "text-primary" : "text-foreground"}`}
              href="/dashboard"
            >
              Dashboard
            </NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem isActive={pathname === "/devices"}>
            <NextLink 
              className={`w-full ${pathname === "/devices" ? "text-primary" : "text-foreground"}`}
              href="/devices"
            >
              Dispositivos
            </NextLink>
          </NavbarMenuItem>
          <NavbarMenuItem isActive={pathname === "/content"}>
            <NextLink 
              className={`w-full ${pathname === "/content" ? "text-primary" : "text-foreground"}`}
              href="/content"
            >
              Conteúdo
            </NextLink>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
      <main className="container mx-auto px-6 py-4">
        {children}
      </main>
    </div>
  );
}
