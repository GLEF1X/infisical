import { useMemo } from "react";
import { faSquarePen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";

import { IconButton, Td, Tr } from "@app/components/v2";
import { CredentialType, TUserCredential } from "@app/hooks/api/credentials";
import { UsePopUpState } from "@app/hooks/usePopUp";

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
  const credentialName = useMemo((): string => {
    if (row.label) return row.label

    if (row.type === CredentialType.WEB_LOGIN) {
      return row.data.username ?? "----" 
    } 
    if (row.type === CredentialType.SECURE_NOTE) {
      // TODO: make label for secure note required like in bitwarden
      return "Secure note"
    } 

    if (!row.data.cardNumber) return "Credit card"

    return "*****************".concat(row.data.cardNumber.slice(-4))
  }, [row])

  return (
    <Tr
        key={row.id}
      >
        <Td>{row.type}</Td>
        <Td>{credentialName}</Td>
        <Td>{`${format(new Date(row.createdAt), "yyyy-MM-dd - HH:mm a")}`}</Td>
        <Td>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handlePopUpOpen("updateUserCredential", {
                id: row.id
              });
            }}
            variant="plain"
            ariaLabel="delete"
          >
            <FontAwesomeIcon icon={faSquarePen} />
          </IconButton>
        </Td>
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
  );
};
