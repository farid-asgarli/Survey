import { EmptyStr } from "@src/static/string";

export function lorem(count: number = 1, type: "p" | "s" = "p") {
  const sentence = "Dolor in aute fugiat id. Fugiat pariatur et cupidatat tempor. Velit dolore labore officia amet velit proident.";

  const paragraph = `Adipisicing ipsum enim duis
    consectetur nulla excepteur culpa anim do nostrud nulla sunt elit exercitation. Aute reprehenderit consectetur anim est
    quis labore laboris nostrud ad consequat. Occaecat ullamco id ut occaecat nisi exercitation cillum dolore id in
    consectetur est qui ad. Ut nulla aute sint esse eu eu dolore elit irure. Sint proident dolore magna nostrud amet
    proident nostrud incididunt ullamco enim id. Esse excepteur labore nostrud in. Irure pariatur eiusmod aute reprehenderit
    nulla nisi adipisicing ipsum irure. Ex qui nulla laboris velit est in proident. Deserunt proident eiusmod aliqua Lorem
    laborum officia minim sit ut culpa cillum dolore consequat pariatur. Deserunt minim enim duis irure culpa. Anim id elit
    excepteur magna qui minim proident aliquip magna nostrud deserunt voluptate. Exercitation esse qui pariatur nostrud.
    Culpa mollit consequat fugiat mollit ipsum ad consequat cillum.\n`;

  let s = EmptyStr;

  if (type === "s") for (let index = 0; index < count; index++) s += sentence;
  else for (let index = 0; index < count; index++) s += paragraph;

  return s;
}
