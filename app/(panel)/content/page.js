"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  SelectItem,
  useDisclosure,
  Input,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { 
  subscribeToGroups, 
  uploadGroupMedia,
  removeMediaFromGroup,
  updateMediaDuration,
  subscribeToDevices,
  triggerDeviceSync
} from "@/lib/firebase/collections";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { MediaUploadModal } from "@/components/modals/media-upload-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { LoadingContent } from "@/components/loading";
import { SyncNotification } from "@/components/sync-notification";

const OPTIMAL_DIMENSIONS = {
  width: 1920,
  height: 1080,
  aspectRatio: 1920 / 1080
};

export default function ContentPage() {
  const searchParams = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);

  // Media Upload Modal
  const {
    isOpen: isMediaModalOpen,
    onOpen: openMediaModal,
    onClose: closeMediaModal
  } = useDisclosure();

  // Confirm Modal
  const {
    isOpen: isConfirmModalOpen,
    onOpen: openConfirmModal,
    onClose: closeConfirmModal
  } = useDisclosure();
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // Add debounce timeout ref
  const durationTimeoutRef = useRef({});

  // Add local state to track input values
  const [localDurations, setLocalDurations] = useState({});

  // Add new state for sync notification
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const [devices, setDevices] = useState([]);

  // Subscribe to devices to know which ones are online
  useEffect(() => {
    const unsubscribe = subscribeToDevices((updatedDevices) => {
      setDevices(updatedDevices);
    });

    return () => unsubscribe();
  }, []);

  // Show notification when content changes
  const triggerSyncNotification = useCallback(() => {
    setShowSyncNotification(true);
  }, []);

  // Handle sync action
  const handleSync = async () => {
    if (!selectedGroup) return;

    try {
      // Get all online devices from this group
      const groupDevices = devices.filter(
        device => device.groupId === selectedGroup && device.status === 'online'
      );

      // Trigger sync for all online devices
      await Promise.all(
        groupDevices.map(device => triggerDeviceSync(device.id))
      );

      toast.success('Sincronização iniciada nos dispositivos');
      setShowSyncNotification(false);
    } catch (error) {
      toast.error('Erro ao sincronizar dispositivos');
    }
  };

  // Update the debounced function
  const debouncedUpdateDuration = useCallback((mediaId, value) => {
    if (durationTimeoutRef.current[mediaId]) {
      clearTimeout(durationTimeoutRef.current[mediaId]);
    }

    durationTimeoutRef.current[mediaId] = setTimeout(async () => {
      try {
        await updateMediaDuration(selectedGroup, mediaId, value);
        toast.success('Duração atualizada com sucesso!');
        triggerSyncNotification();
      } catch (error) {
        toast.error(error.message);
      }
      delete durationTimeoutRef.current[mediaId];
    }, 1500); // Wait 3 seconds after last change
  }, [selectedGroup, triggerSyncNotification]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(durationTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Update the handler to manage local state
  const handleDurationChange = (mediaId, value) => {
    if (!selectedGroup) return;
    
    // Update local state immediately
    setLocalDurations(prev => ({
      ...prev,
      [mediaId]: value
    }));
    
    // Trigger debounced update
    debouncedUpdateDuration(mediaId, value);
  };

  useEffect(() => {
    const unsubscribe = subscribeToGroups((updatedGroups) => {
      setGroups(updatedGroups);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set initial group from URL parameter
  useEffect(() => {
    const groupId = searchParams.get('group');
    if (groupId && groups.some(g => g.id === groupId)) {
      setSelectedGroup(groupId);
    }
  }, [searchParams, groups]);

  const handleMediaSubmit = async (data) => {
    if (!selectedGroup) {
      toast.error('Selecione um grupo primeiro');
      return;
    }

    setModalLoading(true);
    try {
      await uploadGroupMedia(selectedGroup, data.file, {
        name: data.name,
        duration: data.duration
      });
      toast.success('Conteúdo adicionado com sucesso!');
      closeMediaModal();
      triggerSyncNotification();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteMedia = (mediaId) => {
    if (!selectedGroup) return;

    setConfirmAction(() => async () => {
      try {
        await removeMediaFromGroup(selectedGroup, mediaId);
        toast.success('Conteúdo removido com sucesso!');
        closeConfirmModal();
        triggerSyncNotification();
      } catch (error) {
        toast.error(error.message);
      }
    });
    setConfirmData({
      title: "Remover Conteúdo",
      message: "Tem certeza que deseja remover este conteúdo? Esta ação não pode ser desfeita."
    });
    openConfirmModal();
  };

  const selectedGroupData = groups.find(g => g.id === selectedGroup);

  if (loading) {
    return <LoadingContent message="Carregando grupos..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Conteúdo</h1>
      </div>

      <Card className="bg-content1">
        <CardBody>
          <div className="flex flex-col gap-4">
            <Select
              label="Selecione um grupo"
              placeholder="Escolha um grupo para gerenciar o conteúdo"
              selectedKeys={selectedGroup ? [selectedGroup] : []}
              onChange={(e) => setSelectedGroup(e.target.value)}
            >
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </Select>

            {selectedGroup && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Conteúdo do grupo: {selectedGroupData?.name}
                  </h2>
                  <Button
                    color="primary"
                    startContent={<Icon icon="solar:add-circle-bold" />}
                    onPress={openMediaModal}
                  >
                    Adicionar Conteúdo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedGroupData?.media?.map((media) => (
                    <Card key={media.id} className="bg-content2">
                      <CardBody>
                        <div className="relative">
                          <div className="aspect-video bg-default-100 rounded-lg mb-2 overflow-hidden">
                            {media.url ? (
                              media.type === 'video' ? (
                                <video 
                                  src={media.url} 
                                  className="w-full h-full object-contain"
                                  controls
                                />
                              ) : (
                                <div className="relative w-full h-full">
                                  <img 
                                    src={media.url} 
                                    alt={media.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "placeholder-image-url";
                                    }}
                                  />
                                </div>
                              )
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                                <Icon 
                                  icon={media.type === 'video' ? 'solar:videocamera-record-bold' : 'solar:gallery-wide-bold'} 
                                  className="text-4xl text-default-400" 
                                />
                                <p className="text-tiny text-default-400 text-center">
                                  Visualização não disponível
                                </p>
                              </div>
                            )}
                          </div>

                          {media.dimensions && (
                            Math.abs(media.dimensions.width / media.dimensions.height - OPTIMAL_DIMENSIONS.aspectRatio) > 0.1 && (
                              <Chip
                                size="sm"
                                color="warning"
                                variant="flat"
                                className="absolute top-2 right-2"
                                startContent={<Icon icon="solar:danger-triangle-bold" />}
                              >
                                Dimensões não ideais
                              </Chip>
                            )
                          )}
                        </div>

                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium truncate" title={media.name}>{media.name}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Chip
                                size="sm"
                                variant="flat"
                                color={media.type === 'video' ? 'primary' : 'secondary'}
                                startContent={
                                  <Icon 
                                    icon={media.type === 'video' ? 
                                      'solar:videocamera-record-bold' : 
                                      'solar:gallery-wide-bold'
                                    } 
                                  />
                                }
                              >
                                {media.type === 'video' ? 'Vídeo' : 'Imagem'}
                              </Chip>
                              
                              {media.type === 'image' && (
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min="1"
                                    size="sm"
                                    className="w-20"
                                    value={localDurations[media.id]?.toString() ?? media.duration?.toString() ?? ''}
                                    onValueChange={(value) => handleDurationChange(media.id, value)}
                                    endContent={
                                      <span className="text-small text-default-400">s</span>
                                    }
                                    classNames={{
                                      input: "text-right"
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            onPress={() => handleDeleteMedia(media.id)}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}

                  {(!selectedGroupData?.media?.length) && (
                    <div className="col-span-full text-center py-12 text-default-500">
                      <div className="flex flex-col items-center">
                        <Icon icon="solar:box-minimalistic-bold" className="text-6xl mb-4" />
                        <p className="text-xl mb-2">Nenhum conteúdo cadastrado</p>
                        <p>Clique em "Adicionar Conteúdo" para começar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <MediaUploadModal
        isOpen={isMediaModalOpen}
        onClose={closeMediaModal}
        onConfirm={handleMediaSubmit}
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

      <SyncNotification 
        isVisible={showSyncNotification}
        onSync={handleSync}
        onDismiss={() => setShowSyncNotification(false)}
      />
    </div>
  );
} 