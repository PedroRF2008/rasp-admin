"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { 
  subscribeToGroups,
  subscribeToDevices,
  addDevice,
  updateDevice,
  removeDevice 
} from "@/lib/firebase/collections";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { DeviceModal } from "@/components/modals/device-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { LoadingContent } from "@/components/loading";

const statusConfig = {
  online: { color: "success", icon: "solar:check-circle-bold", text: "Online" },
  offline: { color: "danger", icon: "solar:close-circle-bold", text: "Offline" },
  updating: { color: "warning", icon: "solar:refresh-circle-bold", text: "Atualizando" },
  error: { color: "danger", icon: "solar:danger-circle-bold", text: "Erro" },
};

export default function DevicesPage() {
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  
  // Device Modal
  const {
    isOpen: isDeviceModalOpen,
    onOpen: openDeviceModal,
    onClose: closeDeviceModal
  } = useDisclosure();
  const [editingDevice, setEditingDevice] = useState(null);

  // Confirm Modal
  const {
    isOpen: isConfirmModalOpen,
    onOpen: openConfirmModal,
    onClose: closeConfirmModal
  } = useDisclosure();
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  useEffect(() => {
    const unsubscribeGroups = subscribeToGroups((updatedGroups) => {
      setGroups(updatedGroups);
    });

    const unsubscribeDevices = subscribeToDevices((updatedDevices) => {
      setDevices(updatedDevices);
      setLoading(false);
    });

    return () => {
      unsubscribeGroups();
      unsubscribeDevices();
    };
  }, []);

  // Handle URL parameters
  useEffect(() => {
    const groupId = searchParams.get('group');
    const action = searchParams.get('action');
    const deviceId = searchParams.get('id');

    if (groupId) {
      setSelectedGroup(groupId);
    }

    if (action === 'new' && groupId) {
      handleAddDevice(groupId);
    } else if (action === 'edit' && deviceId) {
      const deviceToEdit = devices.find(d => d.id === deviceId);
      if (deviceToEdit) {
        handleEditDevice(deviceToEdit);
      }
    }
  }, [searchParams, devices]);

  const handleAddDevice = (groupId = null) => {
    setEditingDevice(null);
    openDeviceModal();
  };

  const handleDeviceSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.id, data);
        toast.success('Dispositivo atualizado com sucesso!');
      } else {
        await addDevice(data);
        toast.success('Dispositivo adicionado com sucesso!');
      }
      closeDeviceModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteDevice = (deviceId) => {
    setConfirmAction(() => async () => {
      try {
        await removeDevice(deviceId);
        toast.success('Dispositivo removido com sucesso!');
        closeConfirmModal();
      } catch (error) {
        toast.error(error.message);
      }
    });
    setConfirmData({
      title: "Remover Dispositivo",
      message: "Tem certeza que deseja remover este dispositivo? Esta ação não pode ser desfeita."
    });
    openConfirmModal();
  };

  const handleEditDevice = (device) => {
    setEditingDevice(device);
    openDeviceModal();
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.groupName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGroup = selectedGroup === "all" || device.groupId === selectedGroup;
    
    return matchesSearch && matchesGroup;
  });

  if (loading) {
    return <LoadingContent message="Carregando dispositivos..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dispositivos</h1>
        <Button 
          color="primary"
          startContent={<Icon icon="solar:add-circle-bold" />}
          onPress={handleAddDevice}
        >
          Novo Dispositivo
        </Button>
      </div>

      <Card className="bg-content1">
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Buscar dispositivos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Icon className="text-default-400" icon="solar:magnifer-linear" width={20} />}
                className="flex-1"
              />
              <Select
                placeholder="Filtrar por grupo"
                selectedKeys={[selectedGroup]}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full sm:w-72"
              >
                <SelectItem key="all" value="all">
                  Todos os grupos
                </SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              {filteredDevices.map((device) => (
                <div 
                  key={device.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-medium bg-content2 gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-tiny text-default-500">{device.ip}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip
                        color={statusConfig[device.status].color}
                        variant="flat"
                        size="sm"
                        startContent={<Icon icon={statusConfig[device.status].icon} />}
                      >
                        {statusConfig[device.status].text}
                      </Chip>
                      <Chip
                        variant="flat"
                        size="sm"
                        startContent={<Icon icon="solar:users-group-rounded-bold" />}
                      >
                        {device.groupName}
                      </Chip>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={() => handleEditDevice(device)}
                    >
                      <Icon icon="solar:pen-bold" width={20} />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      onPress={() => handleDeleteDevice(device.id)}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" width={20} />
                    </Button>
                  </div>
                </div>
              ))}

              {filteredDevices.length === 0 && (
                <div className="text-center py-12 text-default-500">
                  <div className="flex flex-col items-center">
                    <Icon icon="solar:box-minimalistic-bold" className="text-6xl mb-4" />
                    <p className="text-xl mb-2">Nenhum dispositivo encontrado</p>
                    <p>Clique em "Novo Dispositivo" para começar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={closeDeviceModal}
        onConfirm={handleDeviceSubmit}
        initialData={editingDevice}
        selectedGroup={selectedGroup !== "all" ? selectedGroup : null}
        groups={groups}
        isLoading={modalLoading}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmAction}
        title={confirmData?.title}
        message={confirmData?.message}
        isLoading={modalLoading}
      />
    </div>
  );
} 