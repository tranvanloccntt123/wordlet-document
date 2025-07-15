import { setQueryData } from "@/hooks/useQuery";
import { getGroupKey, getOwnerGroupKey } from "@/utils/string";
import {
  createGroup,
  deleteGroup,
  getOwnerGroup,
  updateGroup,
} from "./supabase";

export const updateGroupInfo = async (
  groupId: number,
  updater: Group | Updater<Group | undefined>
) => {
  const newData = setQueryData(getGroupKey(groupId), updater);
  if (newData) {
    await updateGroup(newData);
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
