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
  Textarea
} from "@nextui-org/react";

export function DeviceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialData, 
  selectedGroup,
  groups,
  isLoading 
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onConfirm({
      name: formData.get("name"),
      description: formData.get("description"),
      type: formData.get("type"),
      groupId: formData.get("groupId"),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {initialData ? "Editar Dispositivo" : "Novo Dispositivo"}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Input
                label="Nome"
                placeholder="Digite o nome do dispositivo"
                name="name"
                defaultValue={initialData?.name}
                isRequired
                isDisabled={isLoading}
              />
              
              <Textarea
                label="Descrição"
                placeholder="Digite uma descrição (opcional)"
                name="description"
                defaultValue={initialData?.description}
                isDisabled={isLoading}
              />

              <Select
                label="Tipo"
                placeholder="Selecione o tipo"
                name="type"
                defaultSelectedKeys={[initialData?.type || "display_tv"]}
                isRequired
                isDisabled={isLoading}
              >
                <SelectItem key="display_tv" value="display_tv">TV/Monitor</SelectItem>
              </Select>

              <Select
                label="Grupo"
                placeholder="Selecione o grupo"
                name="groupId"
                defaultSelectedKeys={initialData?.groupId ? [initialData.groupId] : selectedGroup ? [selectedGroup] : undefined}
                isRequired
                isDisabled={isLoading}
              >
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
              Cancelar
            </Button>
            <Button color="primary" type="submit" isLoading={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 