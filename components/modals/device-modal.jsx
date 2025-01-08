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
import { useEffect, useState } from "react";

const deviceTypes = [
  { id: "display_tv", name: "Display TV" }
];

export function DeviceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  initialData, 
  selectedGroup,
  groups = [],
  isLoading 
}) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [deviceType, setDeviceType] = useState("display_tv");
  const [nameError, setNameError] = useState("");
  const [ipError, setIpError] = useState("");
  const [groupError, setGroupError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setName(initialData?.name || "");
      setIp(initialData?.ip || "");
      setDescription(initialData?.description || "");
      setGroupId(selectedGroup || initialData?.groupId || "");
      setDeviceType(initialData?.type || "display_tv");
      setNameError("");
      setIpError("");
      setGroupError("");
    }
  }, [isOpen, initialData, selectedGroup]);

  const handleIpChange = (value) => {
    // Only allow numbers and dots
    const formatted = value.replace(/[^\d.]/g, '');
    
    // Prevent consecutive dots
    if (formatted.includes('..')) return;
    
    // Limit to 4 groups of numbers
    const parts = formatted.split('.');
    if (parts.length > 4) return;
    
    // Limit each group to 3 digits
    if (parts.some(part => part.length > 3)) return;
    
    setIp(formatted);
  };

  const handleSubmit = () => {
    // Reset errors
    setNameError("");
    setIpError("");
    setGroupError("");

    // Validate fields
    let hasError = false;

    if (!name.trim()) {
      setNameError("O nome do dispositivo é obrigatório");
      hasError = true;
    }

    if (!ip.trim()) {
      setIpError("O IP do dispositivo é obrigatório");
      hasError = true;
    } else if (!isValidIP(ip.trim())) {
      setIpError("IP inválido");
      hasError = true;
    }

    if (!groupId) {
      setGroupError("O grupo é obrigatório");
      hasError = true;
    }

    if (hasError) return;

    onConfirm({
      name: name.trim(),
      ip: ip.trim(),
      description: description.trim(),
      groupId,
      type: deviceType
    });
  };

  const isValidIP = (ip) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        <ModalHeader>
          {initialData ? "Editar Dispositivo" : "Novo Dispositivo"}
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Nome do dispositivo"
              placeholder="Digite o nome do dispositivo"
              value={name}
              onValueChange={setName}
              errorMessage={nameError}
              isInvalid={!!nameError}
              isRequired
              autoFocus
            />
            <Input
              label="Endereço IP"
              placeholder="Ex: 192.168.1.100"
              value={ip}
              onValueChange={handleIpChange}
              errorMessage={ipError}
              isInvalid={!!ipError}
              isRequired
            />
            <Input
              label="Descrição"
              placeholder="Digite uma descrição para o dispositivo (opcional)"
              value={description}
              onValueChange={setDescription}
            />
            <Select
              label="Grupo"
              placeholder="Selecione um grupo"
              selectedKeys={groupId ? [groupId] : []}
              onChange={(e) => setGroupId(e.target.value)}
              errorMessage={groupError}
              isInvalid={!!groupError}
              isRequired
            >
              {(groups || []).map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </Select>
            <Select
              label="Tipo de dispositivo"
              placeholder="Selecione o tipo de dispositivo"
              selectedKeys={[deviceType]}
              onChange={(e) => setDeviceType(e.target.value)}
              isRequired
              isDisabled={!!initialData} // Prevent changing type after creation
            >
              {deviceTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </Select>
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
            {initialData ? "Salvar" : "Criar"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 