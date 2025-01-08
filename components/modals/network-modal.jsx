"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Chip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

export function NetworkModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      hideCloseButton
      isDismissable={false}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="mdi:plug" className="text-2xl" />
          Conexão de Rede Necessária
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <p>
              Para acessar o painel administrativo, você precisa estar conectado à rede:
            </p>
            <div className="flex flex-col gap-2 bg-content2 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon icon="material-symbols:wifi-rounded" className="text-xl" />
                <span className="font-semibold">WD-Phone</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="solar:key-bold" className="text-xl" />
                <Input
                  type="text"
                  value="MoVeLdgt2018"
                  isReadOnly
                  variant="bordered"
                  className="max-w-[200px]"
                  endContent={
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText("MoVeLdgt2018");
                      }}
                    >
                      <Icon icon="solar:copy-bold" />
                    </Button>
                  }
                />
              </div>
            </div>
            <p className="text-small text-default-500">
              Conecte-se à rede WiFi acima e clique em "Continuar" para acessar o sistema.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={onClose}
          >
            Continuar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 