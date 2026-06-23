"use client";

import BlogPostEditor from "@/components/BlogPostEditor";

export default function EditBlogPostPage({ params }) {
  return <BlogPostEditor postId={params.id} />;
}
