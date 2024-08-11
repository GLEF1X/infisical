import { useMemo } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";

import { IconButton, Td, Tr } from "@app/components/v2";
import { useToggle } from "@app/hooks";
import { CredentialType, TUserCredential } from "@app/hooks/api/credentials";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { NewUserCredentialForm } from "./forms/NewUserCredentialForm";
import { UpdateUserCredentialsForm } from "./forms/UpdateUserCredentialForm";

export const UserCredentialRow = ({
  row,
  handlePopUpOpen
}: {
  row: TUserCredential;
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["deleteUserCredential", "updateUserCredential"]>,
    {
      id
    }: {
      id: string;
    }
  ) => void;
}) => {
  const [isRowExpanded, setIsFormExpanded] = useToggle();

  const credentialName = useMemo((): string => {
    if (row.label) return row.label;

    if (row.type === CredentialType.WEB_LOGIN) {
      return row.data.username ?? "----";
    }
    if (row.type === CredentialType.SECURE_NOTE) {
      // TODO: make label for secure note required like in bitwarden
      return "Secure note";
    }

    if (!row.data.cardNumber) return "Credit card";

    return "*****************".concat(row.data.cardNumber.slice(-4));
  }, [row]);

  return (
    <>
      <Tr key={row.id} isHoverable isSelectable onClick={() => setIsFormExpanded.toggle()}>
        <Td>{row.type}</Td>
        <Td>{credentialName}</Td>
        <Td>{`${format(new Date(row.createdAt), "yyyy-MM-dd - HH:mm a")}`}</Td>
        <Td>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handlePopUpOpen("deleteUserCredential", {
                id: row.id
              });
            }}
            variant="plain"
            ariaLabel="delete"
          >
            <FontAwesomeIcon icon={faTrash} />
          </IconButton>
        </Td>
      </Tr>
      {isRowExpanded && (
        <Tr>
          <Td
            colSpan={4}
            className={`bg-bunker-600 px-0 py-0 ${
              isRowExpanded && "border-b-2 border-mineshaft-500"
            }`}
          >
            <div
              className="ml-2 p-2"
              style={{
                width: "calc(100% - 1rem)"
              }}
            >
             <UpdateUserCredentialsForm credential={row}/>
            </div>
          </Td>
        </Tr>
      )}
    </>
  );
};
