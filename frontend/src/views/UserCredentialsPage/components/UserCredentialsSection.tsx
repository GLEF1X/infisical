
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { createNotification } from "@app/components/notifications";
import { Button } from "@app/components/v2";
import { usePopUp } from "@app/hooks";

import { AddUserCredentialModal } from "./AddUserCredentialModal";
import { UserCredentialsTable } from "./UserCredentialsTable";

export function UserCredentialsSection() {
  const { popUp, handlePopUpToggle, handlePopUpClose, handlePopUpOpen } = usePopUp([
    "createUserCredential",
    "deleteUserCredential",
    "updateUserCredential"
  ] as const);

  const onDeleteApproved = async () => {
    try {
      // deleteSharedSecret.mutateAsync({
      //   sharedSecretId: (popUp?.deleteSharedSecretConfirmation?.data as DeleteModalData)?.id
      // });
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
      {/* <DeleteActionModal
        isOpen={popUp.deleteSharedSecretConfirmation.isOpen}
        title={`Delete ${
          (popUp?.deleteSharedSecretConfirmation?.data as DeleteModalData)?.name || " "
        } shared secret?`}
        onChange={(isOpen) => handlePopUpToggle("deleteSharedSecretConfirmation", isOpen)}
        deleteKey={(popUp?.deleteSharedSecretConfirmation?.data as DeleteModalData)?.name}
        onClose={() => handlePopUpClose("deleteSharedSecretConfirmation")}
        onDeleteApproved={onDeleteApproved}
      /> */}
    </div>
  );
}