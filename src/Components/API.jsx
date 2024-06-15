import axios from "axios";

export const AddPost = async (newPost) => {
  await axios.post(
    "https://666043565425580055b310ce.mockapi.io/crud-myself",
    newPost
  );
};

export const getPosts = async () => {
  const res = await axios.get(
    "https://666043565425580055b310ce.mockapi.io/crud-myself"
  );
  return res.data;
};

export const deletePost = async (postToDelete) => {
  const res = await axios.delete(
    "https://666043565425580055b310ce.mockapi.io/crud-myself/" + postToDelete
  );
  return res.data;
};

export const updatePost = async (updatedPost) => {
  const res = await axios.put(
    `https://666043565425580055b310ce.mockapi.io/crud-myself/${updatedPost.id}`,
    updatedPost
  );
  return res.data;
};
