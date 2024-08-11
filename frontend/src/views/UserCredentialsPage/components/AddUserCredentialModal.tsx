import { Modal, ModalContent } from "@app/components/v2";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { NewUserCredentialForm } from "./NewUserCredentialForm";

type Props = {
  popUp: UsePopUpState<["createUserCredential"]>;
  handlePopUpToggle: (
    popUpName: keyof UsePopUpState<["createUserCredential"]>,
    state?: boolean
  ) => void;
};

export const AddUserCredentialModal = ({ popUp, handlePopUpToggle }: Props) => {
  return (
    <Modal
      isOpen={popUp?.createUserCredential?.isOpen}
      onOpenChange={(isOpen) => {
        handlePopUpToggle("createUserCredential", isOpen);
      }}
    >
      <ModalContent
        title="Create a credential"
        subTitle="Create & update all kinds of credentials"
      >
        <NewUserCredentialForm/>
      </ModalContent>
    </Modal>
  );
};
