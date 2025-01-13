"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

export function UserFormModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  user = null 
}) {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("operator");
  const [displayNameError, setDisplayNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (isOpen && user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
      setRole(user.role);
    } else {
      setDisplayName("");
      setEmail("");
      setRole("operator");
    }
    setDisplayNameError("");
    setEmailError("");
  }, [isOpen, user]);

  const validateForm = () => {
    let isValid = true;

    if (!displayName.trim()) {
      setDisplayNameError("Nome é obrigatório");
      isValid = false;
    } else {
      setDisplayNameError("");
    }

    if (!email.trim()) {
      setEmailError("Email é obrigatório");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email inválido");
      isValid = false;
    } else {
      setEmailError("");
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onConfirm({
        displayName,
        email,
        role,
        id: user?.id
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {user ? "Editar Usuário" : "Novo Usuário"}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Nome"
              placeholder="Digite o nome do usuário"
              value={displayName}
              onValueChange={setDisplayName}
              errorMessage={displayNameError}
              isInvalid={!!displayNameError}
              isRequired
              startContent={<Icon icon="solar:user-bold" />}
            />

            <Input
              label="Email"
              placeholder="Digite o email do usuário"
              value={email}
              onValueChange={setEmail}
              errorMessage={emailError}
              isInvalid={!!emailError}
              isRequired
              startContent={<Icon icon="solar:letter-bold" />}
              isDisabled={!!user} // Email can't be edited
            />

            <Select
              label="Função"
              selectedKeys={[role]}
              onChange={e => setRole(e.target.value)}
              isRequired
            >
              <SelectItem key="operator" value="operator">
                Operador
              </SelectItem>
              <SelectItem key="admin" value="admin">
                Administrador
              </SelectItem>
            </Select>

            {!user && (
              <div className="p-3 bg-default-100 rounded-medium">
                <p className="text-sm">
                  <strong>Nota:</strong> Uma senha temporária será gerada. Não esqueça de encaminhar essa senha para o usuário.
                </p>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="flat"
            onPress={onClose}
            isDisabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
          >
            {user ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 