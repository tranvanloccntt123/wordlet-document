import {
  SUPABASE_FUNCTION,
  SUPABASE_SCHEMA,
  SUPABASE_TABLE,
} from "@/constants/Supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import i18next from "i18next";
import { getUsers, supabase } from "./client";

let ownerGroupFetching: any = null;

export const clearOwnerGroupFetching = () => {
  ownerGroupFetching = null;
};

export const createGroup = async (
  name?: string,
  description?: string,
  series_id?: number
) => {
  try {
    const user = await getUsers();
    if (!user) {
      throw "User not found";
    }
    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.CREATE_GROUP,
      {
        body: { user_id: user?.id, words: [], name, description, series_id },
      }
    );

    return response;
  } catch (e) {
    throw e;
  }
};

export const deleteGroup = async (groupId: number) => {
  try {
    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.DELETE_GROUP,
      {
        body: { groupId: groupId },
      }
    );
    return response;
  } catch (e) {
    throw e;
  }
};

const fetchOwnerGroup = async (serieId?: number) => {
  const user = await getUsers();
  if (!user) {
    throw "User not found";
  }
  const query: any = supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.GROUP)
    .select(
      "id, name, created_at, words, is_boosted, user_id, is_publish, description, series_id, series(*)"
    )
    .eq("user_id", user?.id)
    .eq("is_deleted", false);
  if (serieId) {
    const response = query.eq("series_id", serieId);
    return response;
  }
  const response: PostgrestSingleResponse<Group[]> = await query;
  return response;
};

export const getOwnerGroup = async (serieId?: number) => {
  try {
    const response: PostgrestSingleResponse<Group[]> = await fetchOwnerGroup(
      serieId
    );
    clearOwnerGroupFetching();
    return response;
  } catch (e) {
    throw e;
  }
};

export const fetchGroupDetail = async (groupId: number) => {
  try {
    const response: PostgrestSingleResponse<Group> = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .select(
        "id, name, created_at, words, is_boosted, user_id, is_publish, description, series_id, series(*)"
      )
      .eq("id", groupId)
      .single();

    return response;
  } catch (e) {
    throw e;
  }
};

export const updateGroup = async (group: Group) => {
  try {
    const { data, error } = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .update({
        name: group.name,
        words: group.words,
        user_id: group.user_id,
        description: group.description,
      })
      .eq("id", group.id)
      .select(
        "id, name, created_at, words, is_boosted, user_id, is_publish, description, series_id, series(*)"
      )
      .single();
    if (error) {
      console.log(error);
      throw i18next.t("groups.errorUpdatingGroup");
    }
    return data;
  } catch (e) {
    throw e;
  }
};

export const publishGroup = async (groupId: number) => {
  try {
    const { data, error } = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .update({ is_publish: true })
      .eq("id", groupId)
      .select(
        "id, name, created_at, words, is_boosted, user_id, is_publish, description, series_id, series(*)"
      )
      .single();
    if (error) {
      console.log(error);
      throw i18next.t("groups.errorUpdatingGroup");
    }
    return data;
  } catch (e) {
    throw e;
  }
};

export const publishRevertGroup = async (groupId: number) => {
  try {
    const { data, error } = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .update({ is_publish: false })
      .eq("id", groupId)
      .select(
        "id, name, created_at, words, is_boosted, user_id, is_publish, description, series_id, series(*)"
      )
      .single();
    if (error) {
      console.log(error);
      throw i18next.t("groups.errorUpdatingGroup");
    }
    return data;
  } catch (e) {
    throw e;
  }
};

export const fetchGroups = async (
  limit: number = 10,
  lastCreatedAt?: string // Pass the 'created_at' of the last fetched item
) => {
  try {
    let query = supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .select(
        "id, name, created_at, words, is_boosted, user_id, is_publish, description, series_id, series(*)"
      )
      .eq("is_publish", true)
      .order("is_boosted", { ascending: false })
      .order("created_at", { ascending: false }) // Fetch newest first
      .limit(limit);
    if (lastCreatedAt) {
      query = query.lt("created_at", lastCreatedAt); // Fetch records older than the lastCreatedAt
    }
    return query;
  } catch (e) {
    throw e;
  }
};

export const fetchGroupsInSerie = async (serieId: number) => {
  try {
    let query = supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .select(
        "id, name, created_at, words, is_boosted, user_id, is_publish, description, series_id"
      )
      .eq("is_publish", true)
      .eq("series_id", serieId)
      .order("is_boosted", { ascending: false })
      .order("created_at", { ascending: false }); // Fetch newest first
    return query;
  } catch (e) {
    throw e;
  }
};
