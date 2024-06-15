import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AddPost, deletePost, getPosts, updatePost } from "./API";

const Body = () => {
  const queryClient = useQueryClient();

  const { data: posts, isPending: isFetching } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
    staleTime: 1000,
  });

  const { mutate, isPending, error, variables } = useMutation({
    mutationKey: "addPost",
    mutationFn: AddPost,
    onSuccess: async () => {
      return await queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deletePosts = useMutation({
    mutationKey: "DeletePost",
    onMutate: async (postToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData({ queryKey: ["posts"] });
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.filter((p) => p.id !== postToDelete)
      );
      return { previousPosts };
    },
    mutationFn: deletePost,
    onError: (context) => {
      queryClient.setQueryData(["posts"], context.previousPosts);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleDone = useMutation({
    mutationKey: "UpdatePost",
    onMutate: async (updatedPost) => {
      await queryClient.cancelQueries(["posts"]);
      queryClient.setQueryData(["posts"], (oldPosts) =>
        oldPosts.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      );
      return queryClient.getQueryData(["posts"]);
    },
    mutationFn: updatePost,
    onError: (err, context) => {
      queryClient.setQueryData(["posts"], context);
      console.error("Error updating post:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handleDelete = (post) => {
    queryClient.setQueryData(["posts"], (oldPosts) =>
      oldPosts.filter((p) => p.id !== post.id)
    );
    // posts.filter((p) => p.id !== post.id);
    deletePosts.mutate(post.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (e.key === "Enter" && e.target.title.value === "") return;
    const newPost = {
      id: Date.now(),
      title: e.target.title.value,
      done: false,
    };
    if (!newPost.title) return;
    mutate(newPost);
    e.target.title.value = "";
  };

  const toggleDone = (post) => {
    const updatedPost = { ...post, done: !post.done };
    handleDone.mutate(updatedPost);
  };

  return (
    <div className="h-100 w-full flex items-center justify-center bg-teal-lightest font-sans">
      <div className="bg-white rounded shadow p-6 m-4 w-full lg:w-3/4 lg:max-w-lg">
        <div className="mb-4">
          <h1 className="text-grey-darkest">Todo List</h1>
          <form className="flex mt-4" onSubmit={handleSubmit}>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 mr-4 text-grey-darker"
              placeholder="Add Todo"
              name="title"
            />
            <button
              className="flex-no-shrink p-2 border-2 rounded text-teal border-teal hover:bg-teal"
              type="submit"
            >
              Add
            </button>
          </form>
        </div>
        <div>
          {isFetching && <p className="text-center">Loading posts...</p>}

          {error && <p className="text-red-500">{error.message}</p>}
          {posts?.map((post) => (
            <div className="flex mb-4 items-center" key={post.id}>
              <span
                className={`text-center ${
                  post.done ? "line-through" : ""
                } shadow appearance-none border rounded w-full py-2 px-3 mr-4 text-grey-darker`}
              >
                {post.title}
              </span>
              <button
                onClick={() => toggleDone(post)}
                className="flex-no-shrink p-2 ml-4 mr-2 border-2 rounded text-green border-green"
              >
                {post.done ? "Undone" : "Done"}
              </button>
              <button
                className="flex-no-shrink p-2 ml-2 border-2 rounded text-red border-red hover:bg-red"
                onClick={() => handleDelete(post)}
              >
                Remove
              </button>
            </div>
          ))}
          {isPending && (
            <div className="flex items-center mb-4">
              <span
                className="shadow text-center appearance-none border rounded w-full py-2 px-3 mr-4 text-grey-darker"
                key={variables.id}
              >
                {variables.title}
              </span>
              <button className="flex-no-shrink p-2 ml-4 mr-2 border-2 rounded text-green border-green">
                Done
              </button>
              <button className="flex-no-shrink p-2 ml-2 border-2 rounded text-red border-red hover:bg-red">
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Body;
