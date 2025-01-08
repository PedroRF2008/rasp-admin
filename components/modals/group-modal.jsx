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
import { useState } from "react";

export function GroupModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialData = null,
  isLoading 
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? "Editar Grupo" : "Novo Grupo"}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Nome do Grupo"
                placeholder="Digite o nome do grupo"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                isRequired
              />
              <Input
                label="Descrição"
                placeholder="Digite uma descrição para o grupo"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" type="submit" isLoading={isLoading}>
              {initialData ? "Salvar" : "Criar"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 