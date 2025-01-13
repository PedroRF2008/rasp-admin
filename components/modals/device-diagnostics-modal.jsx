"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  Progress,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper function to format bytes to human readable format
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp.seconds * 1000);
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
};

export function DeviceDiagnosticsModal({ isOpen, onClose, device }) {
  if (!device) return null;

  const diagnostics = device.diagnostics || {};
  const memoryPercent = diagnostics.memory?.percent || 0;
  const diskPercent = diagnostics.disk?.percent || 0;
  const cpuPercent = diagnostics.cpu || 0;
  const temperature = diagnostics.temperature || 0;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="solar:monitor-bold" className="text-2xl" />
          Diagnóstico do Dispositivo
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-6">
            {/* Device Info */}
            <Card className="p-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icon icon="solar:info-circle-bold" />
                  Informações Gerais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:tag-bold" className="text-default-500" />
                    <div>
                      <p className="text-small text-default-500">Nome</p>
                      <p className="font-medium">{device.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:clock-circle-bold" className="text-default-500" />
                    <div>
                      <p className="text-small text-default-500">Última Atualização</p>
                      <p className="font-medium">{formatTimestamp(device.lastHeartbeat)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:code-square-bold" className="text-default-500" />
                    <div>
                      <p className="text-small text-default-500">Versão</p>
                      <p className="font-medium">{diagnostics.version || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:clock-square-bold" className="text-default-500" />
                    <div>
                      <p className="text-small text-default-500">Tempo Ativo</p>
                      <p className="font-medium">
                        {Math.floor(diagnostics.uptime / 3600)}h {Math.floor((diagnostics.uptime % 3600) / 60)}m
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* System Resources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPU & Memory */}
              <Card className="p-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="solar:cpu-bold" />
                    Recursos do Sistema
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-small">CPU</span>
                        <span className="text-small">{cpuPercent}%</span>
                      </div>
                      <Progress 
                        value={cpuPercent} 
                        color={cpuPercent > 80 ? "danger" : cpuPercent > 60 ? "warning" : "success"}
                        className="h-3"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-small">Memória</span>
                        <span className="text-small">{memoryPercent}%</span>
                      </div>
                      <Progress 
                        value={memoryPercent}
                        color={memoryPercent > 80 ? "danger" : memoryPercent > 60 ? "warning" : "success"}
                        className="h-3"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-small">Temperatura</span>
                        <span className="text-small">{temperature}°C</span>
                      </div>
                      <Progress 
                        value={(temperature / 80) * 100}
                        color={temperature > 70 ? "danger" : temperature > 60 ? "warning" : "success"}
                        className="h-3"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Storage */}
              <Card className="p-4">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Icon icon="solar:hard-drive-bold" />
                    Armazenamento
                  </h3>
                  
                  <div className="flex flex-col gap-2">
                    <Progress 
                      value={diskPercent}
                      color={diskPercent > 80 ? "danger" : diskPercent > 60 ? "warning" : "success"}
                      className="h-3"
                    />
                    <div className="flex justify-between text-small">
                      <span>Usado: {formatBytes(diagnostics.disk?.used)}</span>
                      <span>Livre: {formatBytes(diagnostics.disk?.free)}</span>
                    </div>
                    <div className="text-center text-small text-default-500">
                      Total: {formatBytes(diagnostics.disk?.total)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Network Info */}
            <Card className="p-4">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Icon icon="solar:wifi-bold" />
                  Rede
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:wifi-bold" className="text-primary" />
                    <div>
                      <p className="text-small text-default-500">Rede Wi-Fi</p>
                      <p className="font-medium">{diagnostics.wifi?.ssid}</p>
                      <p className="text-tiny text-default-400">Sinal: {diagnostics.wifi?.signal_strength}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Icon icon="solar:ip-bold" className="text-primary" />
                    <div>
                      <p className="text-small text-default-500">Endereço IP</p>
                      <p className="font-medium">{device.ip}</p>
                      <p className="text-tiny text-default-400">
                        Atualizado {formatTimestamp(device.lastIpUpdate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon icon="solar:download-bold" className="text-success" />
                    <div>
                      <p className="text-small text-default-500">Recebidos</p>
                      <p className="font-medium">{formatBytes(diagnostics.network?.bytes_recv)}</p>
                      <p className="text-tiny text-default-400">
                        {diagnostics.network?.packets_recv} pacotes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon icon="solar:upload-bold" className="text-warning" />
                    <div>
                      <p className="text-small text-default-500">Enviados</p>
                      <p className="font-medium">{formatBytes(diagnostics.network?.bytes_sent)}</p>
                      <p className="text-tiny text-default-400">
                        {diagnostics.network?.packets_sent} pacotes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 