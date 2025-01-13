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
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { 
  subscribeToGroups,
  subscribeToDevices,
  addDevice,
  updateDevice,
  removeDevice,
  triggerDeviceSync,
  triggerDeviceReboot
} from "@/lib/firebase/collections";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { DeviceModal } from "@/components/modals/device-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { LoadingContent } from "@/components/loading";
import { DeviceIDModal } from "@/components/modals/device-id-modal";
import { DeviceDiagnosticsModal } from "@/components/modals/device-diagnostics-modal";

const statusConfig = {
  online: { 
    color: "success", 
    icon: "solar:check-circle-bold", 
    text: "Online" 
  },
  offline: { 
    color: "danger", 
    icon: "solar:close-circle-bold", 
    text: "Offline" 
  },
  rebooting: { 
    color: "warning", 
    icon: "solar:restart-bold", 
    text: "Reiniciando" 
  },
  syncing: { 
    color: "primary", 
    icon: "solar:refresh-circle-bold-duotone", 
    text: "Sincronizando" 
  },
  unknown: { 
    color: "default", 
    icon: "solar:question-circle-bold", 
    text: "Desconhecido" 
  }
};

// Helper function to check if device is in an active state
const isDeviceActive = (status) => {
  return status === 'online';
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

  // Device ID Modal
  const {
    isOpen: isDeviceIdModalOpen,
    onOpen: openDeviceIdModal,
    onClose: closeDeviceIdModal
  } = useDisclosure();
  const [newDeviceId, setNewDeviceId] = useState(null);

  // Diagnostics Modal
  const {
    isOpen: isDiagnosticsModalOpen,
    onOpen: openDiagnosticsModal,
    onClose: closeDiagnosticsModal
  } = useDisclosure();
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const unsubscribeGroups = subscribeToGroups((updatedGroups) => {
      setGroups(updatedGroups);
    });

    const unsubscribeDevices = subscribeToDevices((updatedDevices) => {
      // Add debug logging for each device
      console.log('=== Devices Documents ===');
      updatedDevices.forEach(device => {
        console.log(`Device: ${device.name}`, device);
      });
      console.log('=======================');
      
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
        closeDeviceModal();
      } else {
        const deviceId = await addDevice({
          ...data,
          status: 'offline',
          needsSync: false,
        });
        toast.success('Dispositivo criado com sucesso!');
        setNewDeviceId(deviceId);
        closeDeviceModal();
        openDeviceIdModal();
      }
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

  const handleOpenDiagnostics = (device) => {
    setSelectedDevice(device);
    openDiagnosticsModal();
  };

  const handleDeviceSync = async (deviceId) => {
    try {
      await triggerDeviceSync(deviceId);
      toast.success('Sincronização iniciada');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeviceReboot = (deviceId) => {
    setConfirmAction(() => async () => {
      try {
        await triggerDeviceReboot(deviceId);
        toast.success('Reinicialização iniciada');
        closeConfirmModal();
      } catch (error) {
        toast.error(error.message);
      }
    });
    setConfirmData({
      title: "Reiniciar Dispositivo",
      message: "Tem certeza que deseja reiniciar este dispositivo? O conteúdo ficará indisponível durante o processo."
    });
    openConfirmModal();
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
                        color={statusConfig[device.status || 'unknown'].color}
                        variant="flat"
                        size="sm"
                        startContent={<Icon icon={statusConfig[device.status || 'unknown'].icon} />}
                      >
                        {statusConfig[device.status || 'unknown'].text}
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
                    <Tooltip content="Sincronizar conteúdo">
                      <Chip
                        variant="flat"
                        color="primary"
                        className="cursor-pointer"
                        startContent={<Icon icon="solar:refresh-circle-bold" width={20} />}
                        onClick={() => handleDeviceSync(device.id)}
                        isDisabled={!isDeviceActive(device.status)}
                      >
                        Sincronizar
                      </Chip>
                    </Tooltip>

                    <Tooltip content="Reiniciar dispositivo">
                      <Chip
                        variant="flat"
                        color="warning"
                        className="cursor-pointer"
                        startContent={<Icon icon="solar:restart-bold" width={20} />}
                        onClick={() => handleDeviceReboot(device.id)}
                        isDisabled={!isDeviceActive(device.status)}
                      >
                        Reiniciar
                      </Chip>
                    </Tooltip>

                    <Tooltip content="Ver diagnóstico">
                      <Chip
                        variant="flat"
                        color="secondary"
                        className="cursor-pointer"
                        startContent={<Icon icon="solar:chart-bold" width={20} />}
                        onClick={() => handleOpenDiagnostics(device)}
                      >
                        Diagnóstico
                      </Chip>
                    </Tooltip>

                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          variant="light"
                        >
                          <Icon icon="solar:menu-dots-bold" width={20} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Ações do dispositivo">
                        <DropdownItem
                          startContent={<Icon icon="solar:pen-bold" />}
                          onClick={() => handleEditDevice(device)}
                        >
                          Editar
                        </DropdownItem>
                        <DropdownItem
                          startContent={<Icon icon="solar:trash-bin-trash-bold" />}
                          className="text-danger"
                          color="danger"
                          onClick={() => handleDeleteDevice(device.id)}
                        >
                          Remover
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
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

      <DeviceIDModal 
        isOpen={isDeviceIdModalOpen}
        onClose={closeDeviceIdModal}
        deviceId={newDeviceId}
      />

      <DeviceDiagnosticsModal 
        isOpen={isDiagnosticsModalOpen}
        onClose={closeDiagnosticsModal}
        device={selectedDevice}
      />
    </div>
  );
} 