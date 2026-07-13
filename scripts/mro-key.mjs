import sharp from "sharp";
const DIR = "public/assets/shutterbug-ui/";
const isBg = (r,g,b) => Math.min(r,g,b) > 232 && (Math.max(r,g,b)-Math.min(r,g,b)) < 16;
for (const n of [1,2,3,4,5]) {
  const src = `${DIR}mr-o-${n}.png`;
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, c = info.channels, N = W*H;
  const bg = new Uint8Array(N); // 1 = background (flood-reached)
  const stack = [];
  const push = (x,y) => { if (x<0||y<0||x>=W||y>=H) return; const p=y*W+x; if (bg[p]) return; const i=p*c; if (!isBg(data[i],data[i+1],data[i+2])) return; bg[p]=1; stack.push(p); };
  for (let x=0;x<W;x++){ push(x,0); push(x,H-1); }
  for (let y=0;y<H;y++){ push(0,y); push(W-1,y); }
  while (stack.length){ const p=stack.pop(); const x=p%W, y=(p-x)/W; push(x+1,y); push(x-1,y); push(x,y+1); push(x,y-1); }
  let cut=0;
  for (let p=0;p<N;p++){ if (bg[p]){ data[p*c+3]=0; cut++; } }
  await sharp(data,{raw:{width:W,height:H,channels:c}}).png().toFile(src+".tmp");
  await sharp(src+".tmp").toFile(src);
  console.log(`mr-o-${n}: cut ${(100*cut/N).toFixed(0)}%`);
}
