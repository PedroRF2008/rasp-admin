"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export function ChangePasswordModal({ isOpen, onClose, onSubmit }) {
  useEffect(() => {
    console.log("Change password modal state:", { isOpen });
  }, [isOpen]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (formData.password !== formData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      await onSubmit(formData.password);
      setFormData({ password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isDismissable={false}
      hideCloseButton
      size="lg"
      classNames={{
        base: "bg-content1",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="solar:shield-keyhole-bold-duotone" className="text-2xl text-primary" />
          Primeiro Acesso Detectado
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-6">
            <Card className="bg-primary/10 border-none">
              <CardBody className="gap-2">
                <div className="flex gap-3">
                  <Icon icon="solar:info-circle-bold-duotone" className="text-xl text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Bem-vindo ao Sistema de Gerenciamento de Quiosques!
                    </p>
                    <p className="text-sm text-foreground/80">
                      Para sua segurança, é necessário alterar a senha temporária antes de continuar.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="flex flex-col gap-4">
              <Input
                type={showPassword ? "text" : "password"}
                label="Nova Senha"
                name="password"
                value={formData.password}
                onChange={handleChange}
                variant="bordered"
                endContent={
                  <button className="focus:outline-none" type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <Icon icon="solar:eye-bold" className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <Icon icon="solar:eye-closed-bold" className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
              <Input
                type={showPassword ? "text" : "password"}
                label="Confirmar Nova Senha"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                variant="bordered"
                endContent={
                  <button className="focus:outline-none" type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <Icon icon="solar:eye-bold" className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <Icon icon="solar:eye-closed-bold" className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
              <p className="text-xs text-foreground/50">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={!formData.password || !formData.confirmPassword}
            className="w-full"
            size="lg"
            startContent={!loading && <Icon icon="solar:shield-keyhole-bold" />}
          >
            Alterar Senha e Continuar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 