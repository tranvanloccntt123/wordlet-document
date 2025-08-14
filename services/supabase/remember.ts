import { SUPABASE_TABLE } from "@/constants/Supabase";
import { getUsers, supabase } from "./client";

export const fetchWordLearning = async () => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    let query = supabase!
      .from(SUPABASE_TABLE.WORD_LEARNING)
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false }); // Fetch newest first

    return query;
  } catch (e) {
    throw e;
  }
};

export const addWordLearning = async (word: Omit<WordStore, "id">) => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    let query = supabase!
      .from(SUPABASE_TABLE.WORD_LEARNING)
      .insert({
        word,
        user_id: user?.id,
      })
      .select();

    return query;
  } catch (e) {
    throw e;
  }
};

export const deleteWordLearning = async (id: number) => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    let query = supabase!
      .from(SUPABASE_TABLE.WORD_LEARNING)
      .delete()
      .eq("user_id", user?.id)
      .eq("id", id)
      .select();

    return query;
  } catch (e) {
    throw e;
  }
};

export const deleteWordLearningByUserId = async () => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    let query = supabase!
      .from(SUPABASE_TABLE.WORD_LEARNING)
      .delete()
      .eq("user_id", user?.id)
      .select();

    return query;
  } catch (e) {
    throw e;
  }
};

export const addListWordLearning = async (words: Omit<WordStore, "id">[]) => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    let query = supabase!
      .from(SUPABASE_TABLE.WORD_LEARNING)
      .insert(words.map((word) => ({ word, user_id: user?.id })))
      .select();

    return query;
  } catch (e) {
    throw e;
  }
};
