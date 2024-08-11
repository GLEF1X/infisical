
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { createNotification } from "@app/components/notifications";
import { Button, DeleteActionModal } from "@app/components/v2";
import { usePopUp } from "@app/hooks";
import { useDeleteUserCredential } from "@app/hooks/api/credentials/mutations";

import { AddUserCredentialModal } from "./AddUserCredentialModal";
import { UserCredentialsTable } from "./UserCredentialsTable";

type DeleteModalData = { id: string; label: string; };

export function UserCredentialsSection() {
  const deleteUserCredential = useDeleteUserCredential();
  const { popUp, handlePopUpToggle, handlePopUpClose, handlePopUpOpen } = usePopUp([
    "createUserCredential",
    "deleteUserCredential",
    "updateUserCredential"
  ] as const);

  const onDeleteApproved = async () => {
    try {
      deleteUserCredential.mutateAsync({
        credentialId: (popUp?.deleteUserCredential?.data as DeleteModalData)?.id
      });
      createNotification({
        text: "Successfully deleted credential",
        type: "success"
      });

      handlePopUpClose("deleteUserCredential");
    } catch (err) {
      console.error(err);
      createNotification({
        text: "Failed to delete credential",
        type: "error"
      });
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-mineshaft-600 bg-mineshaft-900 p-4">
      <div className="mb-4 flex justify-between">
        <p className="text-xl font-semibold text-mineshaft-100">Credentials</p>
        <Button
          colorSchema="primary"
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => {
            handlePopUpOpen("createUserCredential");
          }}
        >
          Add credential
        </Button>
      </div>
      <UserCredentialsTable handlePopUpOpen={handlePopUpOpen} />
      <AddUserCredentialModal popUp={popUp} handlePopUpToggle={handlePopUpToggle} />
      <DeleteActionModal
        isOpen={popUp.deleteUserCredential.isOpen}
        title={`Delete ${
          (popUp?.deleteUserCredential?.data as DeleteModalData)?.label || " "
        } credential?`}
        onChange={(isOpen) => handlePopUpToggle("deleteUserCredential", isOpen)}
        deleteKey={(popUp?.deleteUserCredential?.data as DeleteModalData)?.label}
        onClose={() => handlePopUpClose("deleteUserCredential")}
        onDeleteApproved={onDeleteApproved}
      />
    </div>
  );
}