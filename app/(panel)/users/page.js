"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  useDisclosure,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Chip,
  Input,
  Tooltip,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { LoadingContent } from "@/components/loading";
import { UserFormModal } from "@/components/modals/user-form-modal";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { NewUserPasswordModal } from "@/components/modals/new-user-password-modal";
import toast from "react-hot-toast";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { userService } from "@/lib/firebase/services/userService";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newUserPassword, setNewUserPassword] = useState(null);

  // User Form Modal
  const {
    isOpen: isUserModalOpen,
    onOpen: openUserModal,
    onClose: closeUserModal
  } = useDisclosure();

  // Password Modal
  const {
    isOpen: isPasswordModalOpen,
    onOpen: openPasswordModal,
    onClose: closePasswordModal
  } = useDisclosure();

  // Confirm Modal
  const {
    isOpen: isConfirmModalOpen,
    onOpen: openConfirmModal,
    onClose: closeConfirmModal
  } = useDisclosure();
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  // Subscribe to users collection
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const updatedUsers = [];
      snapshot.forEach((doc) => {
        updatedUsers.push({ id: doc.id, ...doc.data() });
      });
      setUsers(updatedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    openUserModal();
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    openUserModal();
  };

  const handleDeleteUser = (user) => {
    setConfirmAction(() => async () => {
      try {
        await userService.deleteUser(user.id);
        toast.success('Usuário removido com sucesso!');
        closeConfirmModal();
      } catch (error) {
        toast.error(error.message);
      }
    });
    setConfirmData({
      title: "Remover Usuário",
      message: `Tem certeza que deseja remover o usuário "${user.displayName}"? Esta ação não pode ser desfeita.`
    });
    openConfirmModal();
  };

  const handleUserSubmit = async (data) => {
    setModalLoading(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, data);
        toast.success('Usuário atualizado com sucesso!');
        closeUserModal();
      } else {
        const result = await userService.createUser(data);
        setNewUserPassword(result.tempPassword);
        toast.success('Usuário criado com sucesso!');
        closeUserModal();
        openPasswordModal();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingContent message="Carregando usuários..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        <Button
          color="primary"
          startContent={<Icon icon="solar:user-plus-bold" />}
          onPress={handleAddUser}
        >
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Buscar usuários..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Icon icon="solar:magnifer-bold" />}
              isClearable
            />

            <Table aria-label="Lista de usuários">
              <TableHeader>
                <TableColumn>NOME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>FUNÇÃO</TableColumn>
                <TableColumn width={200}>AÇÕES</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Nenhum usuário encontrado">
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{user.displayName}</span>
                        {user.firstAccess && (
                          <Tooltip content="Primeiro acesso pendente">
                            <Chip
                              startContent={<Icon icon="solar:shield-warning-bold" className="text-warning" />}
                              variant="flat"
                              color="warning"
                              size="sm"
                            >
                              Primeiro Acesso
                            </Chip>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        color={user.role === 'admin' ? 'primary' : 'secondary'}
                        variant="flat"
                        size="sm"
                      >
                        {user.role === 'admin' ? 'Administrador' : 'Operador'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() => handleEditUser(user)}
                        >
                          <Icon icon="solar:pen-bold" />
                        </Button>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          color="danger"
                          onPress={() => handleDeleteUser(user)}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={closeUserModal}
        onConfirm={handleUserSubmit}
        isLoading={modalLoading}
        user={editingUser}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmAction}
        title={confirmData?.title}
        message={confirmData?.message}
        isLoading={modalLoading}
      />

      <NewUserPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        password={newUserPassword}
      />
    </div>
  );
}
