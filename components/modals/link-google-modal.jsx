"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

export function LinkGoogleModal({ isOpen, onClose, onConfirm, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Vincular conta Google</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <p>
              Deseja vincular sua conta do Google? Isso permitirá que você faça login usando sua conta Google no futuro.
            </p>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-medium">
              <p className="text-sm">
                <strong>Dica:</strong> Vincular sua conta Google oferece uma maneira mais rápida e segura de fazer login.
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={isLoading}
          >
            Agora não
          </Button>
          <Button
            color="primary"
            onPress={onConfirm}
            isLoading={isLoading}
            startContent={!isLoading && <Icon icon="flat-color-icons:google" width={24} />}
          >
            Vincular Google
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 