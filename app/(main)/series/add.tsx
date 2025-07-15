import AddNameAndDescriptionForm from "@/components/AddNameAndDescriptionForm";
import { setQueryData } from "@/hooks/useQuery";
import { insertOwnerSeries } from "@/services/supabase";
import { getOwnerSeriesKey, getSerieDetailKey } from "@/utils/string";
import React from "react";
import { useTranslation } from "react-i18next";

const AddSeries: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AddNameAndDescriptionForm
      title={t("groups.createGroup")}
      onSubmit={async function (name: string, description: string) {
        const { data } = await insertOwnerSeries({ name, description });
        if (data) {
          setQueryData(getSerieDetailKey(data.id), data);
          setQueryData(getOwnerSeriesKey(), (oldData?: number[]) =>
            oldData ? [...oldData, data.id] : oldData
          );
        }
      }}
      initName={""}
      initDescription={""}
    />
  );
};

export default AddSeries;
