import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export function DeviceIDModal({ isOpen, onClose, deviceId }) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(deviceId);
    toast.success('ID copiado para a área de transferência!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isDismissable={false}>
      <ModalContent>
        <ModalHeader>ID do Dispositivo</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="p-3 bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400 rounded-medium">
              <p className="text-sm">
                <strong>ATENÇÃO:</strong> Este é o ID único do seu dispositivo. 
                Guarde-o em um local seguro, pois ele não será mostrado novamente.
              </p>
            </div>
            
            <Input
              value={deviceId}
              isReadOnly
              endContent={
                <Button
                  isIconOnly
                  variant="flat"
                  onPress={handleCopyId}
                >
                  <Icon icon="solar:copy-bold" />
                </Button>
              }
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            Entendi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 