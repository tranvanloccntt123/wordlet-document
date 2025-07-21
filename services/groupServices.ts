import { setQueryData } from "@/hooks/useQuery";
import { getGroupKey, getOwnerGroupKey } from "@/utils/string";
import Toast from "react-native-toast-message";
import {
  createGroup,
  deleteGroup,
  getOwnerGroup,
  updateGroup,
} from "./supabase";

export const updateGroupInfo = async (
  groupId: number,
  updater: Group | Updater<Group | undefined>,
  newWord?: string
) => {
  const newData = await setQueryData(
    getGroupKey(groupId),
    updater,
    async (newData) => {
      if (newData && newData.words.length >= 25) {
        Toast.show({
          type: "limit",
          text1: "Limit title",
          text2: "Limit Description, it is inside the toast config",
        });
        return false;
      }
      return true;
    }
  );
  if (newData) {
    await updateGroup(newData);
    if (newWord) {
      Toast.show({
        type: "addWordSuccess",
        text1: newWord,
      });
    }
  }
};

export const syncOwnerGroup = async () => {
  const { error, data } = await getOwnerGroup();
  if (!error && !!data) {
    data.map((group) => setQueryData(getGroupKey(group.id), group));
    setQueryData(
      getOwnerGroupKey(),
      data.map((v) => v.id)
    );
  }
};

export const createGroupInfo = async (
  name?: string,
  description?: string,
  serieId?: number
) => {
  try {
    const { data, error } = await createGroup(name, description, serieId);
    if (!error && data?.data?.[0]) {
      setQueryData<Group>(getGroupKey(data.data[0].id as number), data.data[0]);
      setQueryData<number[]>(getOwnerGroupKey(serieId), (oldData) => {
        if (!oldData) {
          return [data.data[0].id];
        }
        return [...oldData, data.data[0].id];
      });
      return data.data[0].id;
    }
    throw "Failed to create group";
  } catch (e) {
    throw e;
  }
};

export const deleteGroupInfo = async (groupId: number, serieId?: number) => {
  try {
    await deleteGroup(groupId);
    setQueryData<number[]>(getOwnerGroupKey(serieId), (oldData) => {
      if (!oldData) {
        return oldData;
      }
      return oldData.filter((id) => id !== groupId);
    });
  } catch (e) {}
};
