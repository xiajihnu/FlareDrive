import { notFound } from "./utils";
import { RequestHandlerParams } from "./utils";

export async function handleRequestGet({
  bucket,
  path,
  request,
}: RequestHandlerParams) {
  const obj = await bucket.get(path, {
    onlyIf: request.headers,
    range: request.headers,
  });
  if (obj === null) return notFound();
  if (!("body" in obj))
    return new Response("Preconditions failed", { status: 412 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  
  // 🌟 核心修复：如果是 .txt 结尾的文件，强行追加 UTF-8 编码声明
  if (path.toLowerCase().endsWith(".txt")) {
    headers.set("Content-Type", "text/plain; charset=utf-8");
  }

  if (path.startsWith("_$flaredrive$/thumbnails/"))
    headers.set("Cache-Control", "max-age=31536000");
  return new Response(obj.body, { headers });
}
