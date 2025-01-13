"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";

export function LinkGoogleModal({ isOpen, onClose, onConfirm, isLoading }) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="lg"
      classNames={{
        base: "bg-content1",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex gap-2 items-center">
          <Icon icon="flat-color-icons:google" className="text-2xl" />
          Vincular Conta Google
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-6">
            <Card className="bg-primary/10 border-none">
              <CardBody className="gap-2">
                <div className="flex gap-3">
                  <Icon icon="solar:shield-check-bold-duotone" className="text-xl text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      Melhore a Segurança da sua Conta
                    </p>
                    <p className="text-sm text-foreground/80">
                      Vincular sua conta Google oferece:
                    </p>
                    <ul className="text-sm text-foreground/80 mt-2 space-y-1 list-none">
                      <li className="flex items-center gap-2">
                        <Icon icon="solar:login-2-bold-duotone" className="text-primary" />
                        Login rápido com um clique
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon icon="solar:shield-user-bold-duotone" className="text-primary" />
                        Autenticação de dois fatores
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon icon="solar:key-minimalistic-square-bold-duotone" className="text-primary" />
                        Recuperação de conta simplificada
                      </li>
                    </ul>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-warning-50/10 dark:bg-warning-900/10 border-none">
              <CardBody>
                <div className="flex gap-3">
                  <Icon icon="solar:info-circle-bold-duotone" className="text-xl text-warning mt-0.5" />
                  <div>
                    <p className="text-sm text-warning-600 dark:text-warning-400">
                      Você poderá continuar usando seu email e senha atuais mesmo após vincular sua conta Google.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="light"
            onPress={onClose}
            isDisabled={isLoading}
            className="w-full sm:w-auto"
            startContent={<Icon icon="solar:close-circle-bold-duotone" />}
          >
            Agora não
          </Button>
          <Button
            color="primary"
            onPress={onConfirm}
            isLoading={isLoading}
            className="w-full sm:w-auto"
            startContent={!isLoading && <Icon icon="flat-color-icons:google" className="text-xl" />}
          >
            Vincular Conta Google
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 