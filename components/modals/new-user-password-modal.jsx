"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import toast from "react-hot-toast";

export function NewUserPasswordModal({ isOpen, onClose, password }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copying, setCopying] = useState(false);

  const toggleVisibility = () => setShowPassword(!showPassword);

  const handleCopyPassword = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(password);
      toast.success('Senha copiada para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar senha. Tente novamente.');
    } finally {
      setCopying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          Usuário Criado com Sucesso
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <p>
              O usuário foi criado com sucesso. A senha temporária é:
            </p>
            <div className="flex gap-2">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                isReadOnly
                label="Senha Temporária"
                className="flex-1"
                endContent={
                  <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
                    {showPassword ? (
                      <Icon icon="solar:eye-bold" className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <Icon icon="solar:eye-closed-bold" className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
              />
              <Button
                isIconOnly
                color="primary"
                variant="flat"
                onPress={handleCopyPassword}
                isLoading={copying}
                className="self-end h-14"
              >
                {!copying && <Icon icon="solar:copy-bold" className="text-xl" />}
              </Button>
            </div>
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400 rounded-medium">
              <p className="text-sm">
                <strong>Importante:</strong> Certifique-se de copiar e compartilhar esta senha com o usuário de forma segura.
                O usuário deverá alterar esta senha no primeiro acesso.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={onClose}
          >
            Entendi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 