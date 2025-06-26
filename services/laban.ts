const BASE_URL = "https://dict.laban.vn/find?type=1&query=";
import axios from "axios";
import { parse } from "node-html-parser";

/**
{"content": "0#interested
1#['intristid]
3#Tính từ
5#(interested in somebody / something) quan tâm đến ai/cái gì
7#an interested look/spectator
8#một cái nhìn/khán giả chăm chú
7#I'll be interested to know what happens
8#tôi sẽ thích thú được biết điều đang xảy ra
5#không vô tư; vụ lợi; cầu lợi
7#an interested aid
8#sự viện trợ không vô tư
7#as an interested party, I was not allowed to vote
8#Với tư cách là một bên có liên quan, tôi không được phép bỏ phiếu", "created_at": "2025-06-05T04:54:27.464397+00:00", "id": 148428, "source": "extra_mtb_ev.db", "word": "interested"}
//noun - adjective - verb
*/
//TODO
export const fetchLabanWord = async (word: string): Promise<WordStore> => {
  const res = await axios.get(`${BASE_URL}${word}`);
  const root = parse(res.data as string);
  const type = root
    .querySelector(".entry-body")
    ?.querySelector(".posgram")?.textContent;
  const ipa = root
    .querySelector(".entry-body")
    ?.querySelector(".us")
    ?.querySelector(".ipa")
    ?.textContent?.replaceAll(".", "");
  const content: string = `0#${word}\n${ipa ? `1#[${ipa}]\n` : ``}${
    type ? `3#${type}\n` : ""
  }`;
  const _word = {
    content,
    id: Math.floor(Math.random() * 100) + 1000000,
    source: "cambridge",
    word,
    parsedword: word,
  };

  return _word;
};
