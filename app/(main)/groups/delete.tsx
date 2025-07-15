import DeleteForm from "@/components/DeleteForm";
import { deleteGroupInfo } from "@/services/groupServices";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

const DeleteGroup = () => {
  const params = useLocalSearchParams<{
    x: string;
    y: string;
    groupId?: string;
    groupName?: string;
    serieId?: string;
  }>();
  const { t } = useTranslation();

  return (
    <DeleteForm
      title={t("groups.deleteGroup")}
      subTitle={t("groups.confirmDelete", { groupName: params.groupName })}
      onSubmit={async function () {
        await deleteGroupInfo(
          parseInt(params.groupId || "0"),
          params.serieId ? parseInt(params.serieId || "0") : undefined
        );
      }}
    />
  );
};

export default DeleteGroup;
