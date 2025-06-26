import { Parser } from "htmlparser2";
import { parse } from "node-html-parser";

export const htmlToJson = (htmlString: string): ParseHTMLElement | null => {
  const stack: any = [];
  let root: ParseHTMLElement | null = null;

  const parser = new Parser(
    {
      onopentag(name, attribs) {
        const newNode: ParseHTMLElement = {
          type: "element",
          tag: name,
          attributes: attribs as any,
          children: [],
        };

        if (stack.length === 0) {
          root = newNode; // Set root node
        } else {
          stack[stack.length - 1].children.push(newNode); // Add as child of current node
        }
        stack.push(newNode); // Push to stack
      },
      ontext(text) {
        if (text.trim()) {
          stack[stack.length - 1].children.push({
            type: "text",
            content: text.trim(),
          });
        }
      },
      onclosetag() {
        stack.pop(); // Pop the current node off the stack
      },
    },
    { decodeEntities: true }
  );

  parser.write(htmlString);
  parser.end();

  return root;
};

///html/body/div[2]/div/div[1]/div[2]/article/div[2]/div[1]/div[2]/div/div[3]/div/div/div[1]/div[2]/div[2]/span

/*

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
*/

//noun - adjective - verb

export const queryByFullXPath = (html: string) => {
  const root = parse(html);
  console.log(root.querySelector(".entry-body")?.querySelector(".di-title")?.textContent);
  console.log(root.querySelector(".entry-body")?.querySelector(".posgram")?.textContent);
  console.log(root.querySelector(".entry-body")?.querySelector(".us")?.querySelector(".ipa")?.textContent?.replaceAll(".", ""))
  const ipa = root.querySelector(".entry-body")?.querySelector(".us")?.querySelector(".ipa")?.textContent?.replaceAll(".", "");
};
