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

export function NewUserPasswordModal({ isOpen, onClose, password }) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword(!showPassword);

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
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              isReadOnly
              label="Senha Temporária"
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