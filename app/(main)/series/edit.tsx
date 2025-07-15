import EditNameAndDescriptionForm from "@/components/EditNameAndDescriptionForm";
import useQuery, { setQueryData } from "@/hooks/useQuery";
import { updateOwnerSeries } from "@/services/supabase";
import { getSerieDetailKey } from "@/utils/string";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

const EditGroup: React.FC = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    x: string;
    y: string;
    serieId?: string;
    serieName?: string;
  }>();
  const { data: item } = useQuery({
    key: getSerieDetailKey(parseInt(params.serieId || "0")),
  });

  return (
    <EditNameAndDescriptionForm
      initName={item?.name || ""}
      initDescription={item?.description || ""}
      title={t("groups.editGroupTitle")}
      onSubmit={async function (name: string, description: string) {
        try {
          const response = await updateOwnerSeries({
            ...item,
            id: parseInt(params.serieId || "0"),
            name,
            description,
          });
          setQueryData(
            getSerieDetailKey(parseInt(params.serieId || "0")),
            response.data
          );
        } catch {}
      }}
    />
  );
};

export default EditGroup;
