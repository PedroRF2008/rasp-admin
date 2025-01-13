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
import { Icon } from "@iconify/react";
import { useEffect, useState, useRef } from "react";

const allowedTypes = {
  'image/jpeg': 'Imagem JPEG',
  'image/png': 'Imagem PNG',
  'video/mp4': 'Vídeo MP4',
};

export function MediaUploadModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading 
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [nameError, setNameError] = useState("");
  const [fileError, setFileError] = useState("");
  const [durationError, setDurationError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setName("");
      setDuration("");
      setFile(null);
      setPreview(null);
      setNameError("");
      setFileError("");
      setDurationError("");
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!allowedTypes[selectedFile.type]) {
      setFileError("Tipo de arquivo não suportado");
      return;
    }

    // Validate file size (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setFileError("Arquivo muito grande (máximo 100MB)");
      return;
    }

    setFile(selectedFile);
    setFileError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = () => {
    // Reset errors
    setNameError("");
    setFileError("");
    setDurationError("");

    // Validate fields
    let hasError = false;

    if (!name.trim()) {
      setNameError("O nome do conteúdo é obrigatório");
      hasError = true;
    }

    if (!file) {
      setFileError("Selecione um arquivo");
      hasError = true;
    }

    if (file?.type.startsWith('image/') && !duration.trim()) {
      setDurationError("A duração é obrigatória para imagens");
      hasError = true;
    }

    if (hasError) return;

    onConfirm({
      name: name.trim(),
      duration: duration ? parseInt(duration) : null,
      file
    });
  };

  const handleDurationChange = (value) => {
    // Only allow numbers
    const formatted = value.replace(/[^\d]/g, '');
    setDuration(formatted);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      backdrop="blur"
      size="2xl"
    >
      <ModalContent>
        <ModalHeader>
          Adicionar Conteúdo
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <Input
              label="Nome do conteúdo"
              placeholder="Digite um nome para identificar o conteúdo"
              value={name}
              onValueChange={setName}
              errorMessage={nameError}
              isInvalid={!!nameError}
              isRequired
              autoFocus
            />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Arquivo</p>
              <div 
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-content2 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <div className="aspect-video relative">
                    {file?.type.startsWith('video/') ? (
                      <video 
                        src={preview} 
                        className="w-full h-full object-contain rounded-lg"
                        controls
                      />
                    ) : (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2 items-center">
                      {file?.type.startsWith('image/') && duration && (
                        <div className="bg-default-100 px-2 py-1 rounded-lg text-tiny font-medium">
                          {duration}s
                        </div>
                      )}
                      <Button
                        isIconOnly
                        color="danger"
                        variant="flat"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Icon icon="solar:upload-bold" className="text-4xl" />
                    <div>
                      <p>Clique para selecionar ou arraste um arquivo</p>
                      <p className="text-small text-default-500">
                        Formatos suportados: {Object.values(allowedTypes).join(', ')}
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={Object.keys(allowedTypes).join(',')}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {fileError && (
                <p className="text-tiny text-danger">{fileError}</p>
              )}
            </div>

            {file?.type.startsWith('image/') && (
              <Input
                label="Duração (em segundos)"
                placeholder="Ex: 30"
                value={duration}
                onValueChange={handleDurationChange}
                errorMessage={durationError}
                isInvalid={!!durationError}
                isRequired
                type="number"
                min="1"
                description="Tempo que a imagem ficará em exibição antes de passar para o próximo conteúdo"
              />
            )}

            <div className="p-3 bg-default-100 rounded-medium">
              <p className="text-sm font-medium mb-2">Dimensões recomendadas:</p>
              <div className="flex items-center gap-2 text-small text-default-500">
                <Icon icon="solar:ruler-bold" />
                <span>1920 x 1080 pixels (16:9)</span>
              </div>
              <p className="text-tiny text-default-400 mt-1">
                Para melhor exibição, use imagens e vídeos nesta resolução
              </p>
            </div>
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
            Adicionar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 