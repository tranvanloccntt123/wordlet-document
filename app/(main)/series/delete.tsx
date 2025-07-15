import DeleteForm from "@/components/DeleteForm";
import { setQueryData } from "@/hooks/useQuery";
import { deleteOwnerSeries } from "@/services/supabase";
import { getOwnerSeriesKey } from "@/utils/string";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

const DeleteGroup = () => {
  const params = useLocalSearchParams<{
    x: string;
    y: string;
    serieId?: string;
    serieName?: string;
  }>();
  const { t } = useTranslation();

  return (
    <DeleteForm
      title={t("groups.deleteGroup")}
      subTitle={t("groups.confirmDelete", { groupName: params.serieName })}
      onSubmit={async function () {
        await deleteOwnerSeries(parseInt(params.serieId || "0"));
        setQueryData(getOwnerSeriesKey(), (oldData?: number[]) =>
          oldData
            ? [...oldData].filter(
                (id) => id !== parseInt(params.serieId || "0")
              )
            : oldData
        );
      }}
    />
  );
};

export default DeleteGroup;
