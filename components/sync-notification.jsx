"use client";

import { Button } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

export function SyncNotification({ isVisible, onSync, onDismiss }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 inset-x-0 mx-auto z-50 w-full max-w-2xl px-4"
        >
          <div className="bg-primary/10 backdrop-blur-md rounded-large p-6 shadow-lg border border-primary/20">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Icon icon="solar:refresh-circle-bold-duotone" className="text-3xl text-primary" />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-medium text-foreground text-lg">Alterações pendentes</p>
                <p className="text-foreground/80">Sincronize os dispositivos para aplicar as mudanças</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="md" 
                  variant="light" 
                  onPress={onDismiss}
                >
                  Depois
                </Button>
                <Button 
                  size="md" 
                  color="primary" 
                  onPress={onSync}
                  startContent={<Icon icon="solar:refresh-circle-bold" />}
                >
                  Sincronizar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 