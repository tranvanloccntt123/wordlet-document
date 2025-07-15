import AddNameAndDescriptionForm from "@/components/AddNameAndDescriptionForm";
import { createGroupInfo } from "@/services/groupServices";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

const AddGroup: React.FC = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    serieId?: string;
  }>();
  return (
    <AddNameAndDescriptionForm
      title={t("groups.createGroup")}
      onSubmit={async function (name: string, descrition: string) {
        await createGroupInfo(
          name,
          descrition,
          params.serieId ? parseInt(params.serieId || "0") : undefined
        );
      }}
      initName={""}
      initDescription={""}
    />
  );
};

export default AddGroup;
