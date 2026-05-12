import { useState } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function DiscussionForum() {
  const [posts, setPosts] = useState([{ id: 1, title: "Need help with DBMS indexing", content: "Can someone explain B+ trees?", likes: 3, comments: ["Official answer: meet DBMS faculty in Block B."] }]);
  const [title, setTitle] = useState("");
  const create = () => {
    if (!title.trim()) return;
    setPosts([{ id: Date.now(), title, content: "Student doubt", likes: 0, comments: [] }, ...posts]);
    setTitle("");
  };
  return (
    <div className="grid gap-5">
      <Card className="p-5"><div className="flex gap-3"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ask a campus doubt..." /><Button onClick={create}>Create Post</Button></div></Card>
      {posts.map((post) => <Card key={post.id} className="p-5"><h3 className="text-xl font-black text-white">{post.title}</h3><p className="mt-2 text-sm text-slateText">{post.content}</p><div className="mt-4 flex gap-3"><Button variant="secondary" onClick={() => setPosts((p) => p.map((x) => x.id === post.id ? { ...x, likes: x.likes + 1 } : x))}>Like · {post.likes}</Button><span className="rounded-full bg-cyan/10 px-3 py-2 text-sm text-cyan">Official answer badge ready</span></div>{post.comments.map((c) => <p key={c} className="mt-3 rounded-2xl bg-white/[0.035] p-3 text-sm text-slateText">{c}</p>)}</Card>)}
    </div>
  );
}
