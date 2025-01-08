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
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { 
  subscribeToGroups, 
  createGroup, 
  deleteGroup,
  updateGroup,
  subscribeToDevices,
  removeDevice 
} from "@/lib/firebase/collections";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { GroupModal } from "@/components/modals/group-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { LoadingContent } from "@/components/loading";

const statusConfig = {
  online: { color: "success", icon: "solar:check-circle-bold", text: "Online" },
  offline: { color: "danger", icon: "solar:close-circle-bold", text: "Offline" },
  updating: { color: "warning", icon: "solar:refresh-circle-bold", text: "Atualizando" },
  error: { color: "danger", icon: "solar:danger-circle-bold", text: "Erro" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Group Modal
  const {
    isOpen: isGroupModalOpen,
    onOpen: openGroupModal,
    onClose: closeGroupModal
  } = useDisclosure();
  const [editingGroup, setEditingGroup] = useState(null);

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

  const handleCreateGroup = () => {
    setEditingGroup(null);
    openGroupModal();
  };

  const handleGroupSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, data);
        toast.success('Grupo atualizado com sucesso!');
      } else {
        await createGroup(data.name, { description: data.description });
        toast.success('Grupo criado com sucesso!');
      }
      closeGroupModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteGroup = (groupId) => {
    setConfirmAction(() => async () => {
      try {
        await deleteGroup(groupId);
        toast.success('Grupo excluído com sucesso!');
        closeConfirmModal();
      } catch (error) {
        toast.error(error.message);
      }
    });
    setConfirmData({
      title: "Excluir Grupo",
      message: "Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita."
    });
    openConfirmModal();
  };

  const handleAddDevice = (groupId) => {
    router.push(`/devices?group=${groupId}&action=new`);
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

  const handleNavigateToContent = (groupId) => {
    router.push(`/content?group=${groupId}`);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    openGroupModal();
  };

  const getGroupDevices = (groupId) => {
    return devices.filter(device => device.groupId === groupId);
  };

  if (loading) {
    return <LoadingContent message="Carregando grupos..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button 
          color="primary"
          startContent={<Icon icon="solar:add-circle-bold" />}
          onClick={handleCreateGroup}
        >
          Novo Grupo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group) => {
          const groupDevices = getGroupDevices(group.id);
          return (
            <Card key={group.id} className="bg-content1">
              <CardHeader className="flex justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{group.name}</h3>
                  <p className="text-small text-default-500">
                    {groupDevices.length} dispositivo
                    {groupDevices.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    color="primary" 
                    variant="flat"
                    startContent={<Icon icon="solar:playlist-bold" />}
                    onPress={() => handleNavigateToContent(group.id)}
                  >
                    Conteúdo
                  </Button>
                  <Tooltip content="Sincronizar dispositivos">
                    <Button 
                      isIconOnly
                      variant="flat"
                      color="secondary"
                    >
                      <Icon icon="solar:refresh-circle-bold" width={24} />
                    </Button>
                  </Tooltip>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button 
                        isIconOnly
                        variant="flat"
                      >
                        <Icon icon="solar:menu-dots-bold" width={24} />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Opções do grupo">
                      <DropdownItem
                        startContent={<Icon icon="solar:pen-bold" />}
                        onClick={() => handleEditGroup(group)}
                      >
                        Editar grupo
                      </DropdownItem>
                      <DropdownItem
                        startContent={<Icon icon="solar:add-circle-bold" />}
                        onClick={() => handleAddDevice(group.id)}
                      >
                        Adicionar dispositivo
                      </DropdownItem>
                      <DropdownItem
                        startContent={<Icon icon="solar:trash-bin-trash-bold" />}
                        className="text-danger"
                        color="danger"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        Excluir grupo
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col gap-3">
                  {groupDevices.map((device) => (
                    <div 
                      key={device.id}
                      className="flex items-center justify-between p-3 rounded-medium bg-content2"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-tiny text-default-500">{device.ip}</p>
                        </div>
                        <Chip
                          color={statusConfig[device.status].color}
                          variant="flat"
                          startContent={<Icon icon={statusConfig[device.status].icon} />}
                        >
                          {statusConfig[device.status].text}
                        </Chip>
                      </div>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button 
                            isIconOnly
                            variant="light"
                            size="sm"
                          >
                            <Icon icon="solar:menu-dots-bold" width={20} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Opções do dispositivo">
                          <DropdownItem
                            startContent={<Icon icon="solar:add-square-bold" />}
                          >
                            Adicionar conteúdo personalizado
                          </DropdownItem>
                          <DropdownItem
                            startContent={<Icon icon="solar:pen-bold" />}
                            onClick={() => router.push(`/devices?action=edit&id=${device.id}`)}
                          >
                            Alterar informações
                          </DropdownItem>
                          <DropdownItem
                            startContent={<Icon icon="solar:trash-bin-trash-bold" />}
                            className="text-danger"
                            color="danger"
                            onClick={() => handleDeleteDevice(device.id)}
                          >
                            Remover dispositivo
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  ))}
                  {groupDevices.length === 0 && (
                    <div className="text-center py-6 text-default-500">
                      <div className="flex flex-col items-center">
                        <Icon icon="solar:box-minimalistic-bold" className="text-4xl mb-2" />
                        <p>Nenhum dispositivo cadastrado</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 text-default-500">
            <div className="flex flex-col items-center">
              <Icon icon="solar:box-minimalistic-bold" className="text-6xl mb-4" />
              <p className="text-xl mb-2">Nenhum grupo cadastrado</p>
              <p>Clique em "Novo Grupo" para começar</p>
            </div>
          </div>
        )}
      </div>

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={closeGroupModal}
        onConfirm={handleGroupSubmit}
        initialData={editingGroup}
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