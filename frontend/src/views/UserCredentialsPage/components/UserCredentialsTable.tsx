import { faKey } from "@fortawesome/free-solid-svg-icons";

import {
  EmptyState,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Th,
  THead,
  Tr
} from "@app/components/v2";
import { useGetUserCredentials } from "@app/hooks/api/credentials";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { UserCredentialRow } from "./UserCredentialsRow";

type Props = {
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["deleteUserCredential", "updateUserCredential"]>,
    {
      name,
      id
    }: {
      name: string;
      id: string;
    }
  ) => void;
};

export const UserCredentialsTable = ({ handlePopUpOpen }: Props) => {
  const { isLoading, data } = useGetUserCredentials();

  return (
    <TableContainer>
      <Table>
        <THead>
          <Tr>
            <Th>Type</Th>
            <Th>Name</Th>
            <Th>Created At</Th>
            <Th aria-label="button" className="w-5" />
          </Tr>
        </THead>
        <TBody>
          {isLoading && <TableSkeleton columns={7} innerKey="user-credentials" />}
          {!isLoading &&
            data?.map((row) => (
              <UserCredentialRow key={row.id} row={row} handlePopUpOpen={handlePopUpOpen} />
            ))}
        </TBody>
      </Table>
      {!isLoading && !data?.length && (
        <EmptyState title="No credentials yet" icon={faKey} />
      )}
    </TableContainer>
  );
};
